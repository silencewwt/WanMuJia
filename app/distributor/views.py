# -*- coding: utf-8 -*-
import re

from flask import current_app, render_template, request, redirect, session, url_for, jsonify
from flask.ext.login import login_user, logout_user, current_user
from flask.ext.principal import identity_changed, Identity

from app import db
from app.models import Distributor, Vendor, Stock, Item
from app.constants import DISTRIBUTOR_REGISTER
from app.permission import distributor_permission
from app.utils.redis import redis_get
from . import distributor as distributor_blueprint
from .forms import LoginForm, RegisterForm, StockForm


@distributor_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if request.method == 'POST':
        if form.validate() and form.login():
            return jsonify({'accessGranted': True})
        return jsonify({'accessGranted': False, 'message': u'用户名或密码错误'})
    return render_template('distributor/login.html', form=form)


@distributor_blueprint.route('/register', methods=['GET', 'POST'])
def register():
    if 'register_permission' in session and session['register_permission'] and \
            'vendor_id' in session and Vendor.query.get(session['vendor_id']):
        form = RegisterForm()
        if request.method == 'POST':
            if form.validate():
                distributor = form.add_distributor(session['vendor_id'])
                if distributor is False:
                    pass
                login_user(distributor)
                identity_changed.send(current_app._get_current_object(), identity=Identity(distributor.get_id()))
                session.pop('register_permission')
                session.pop('vendor_id')
                return jsonify({'accessGranted': True})
            return jsonify({'accessGranted': False, 'message': form.error2str()})
        return render_template('distributor/register.html', form=form)
    return 'error', 403


@distributor_blueprint.route('/verify')
def verify():
    token = request.args.get('token', '', type=str)
    action = request.args.get('action', '', type=str)
    vendor_id = redis_get(DISTRIBUTOR_REGISTER, token, delete=True)
    if vendor_id:
        session['register_permission'] = True
        session['vendor_id'] = vendor_id
        return redirect(url_for('.register'))
    return u'已失效'


@distributor_blueprint.route('/stock', methods=['GET', 'POST'])
@distributor_permission.require()
def items_stock():
    page = request.args.get('page', 1, type=int)
    form = StockForm()
    if form.validate_on_submit():
        item_ids = re.findall('(\d+)', form.items.data)
        items = Item.query.filter_by(vendor_id=current_user.vendor_id, is_deleted=False).filter(Item.id.in_(item_ids))
        stocks = Stock.query.filter_by(distributor_id=current_user.id).filter(Item.id.in_([item.id for item in items]))
        for stock in stocks:
            if stock.stock != form.stock.data:
                stock.stock = form.stock.data
                db.session.add(stock)
        for item_id in [item.id for item in items if item.id not in [stock.item_id for stock in stocks]]:
            db.session.add(Stock(item_id=item_id, distributor_id=current_user.id, stock=form.stock.data))
        db.session.commit()
        return 'success'
    items = Item.query.filter_by(vendor_id=current_user.vendor_id).paginate(page, 100, False).items
    return render_template('distributor/items.html', items=items)
