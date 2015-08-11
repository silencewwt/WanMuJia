# -*- coding: utf-8 -*-
from flask import current_app, render_template, request, redirect, session, url_for, jsonify, abort
from flask.ext.login import login_user, logout_user, current_user
from flask.ext.principal import identity_changed, Identity, AnonymousIdentity

from app import db
from app.models import Distributor, Vendor, Stock, Item
from app.constants import DISTRIBUTOR_REGISTER
from app.permission import distributor_permission
from app.utils import data_table_params
from app.utils.redis import redis_get
from . import distributor as distributor_blueprint
from .forms import LoginForm, RegisterForm, SettingsForm


@distributor_blueprint.errorhandler(403)
def forbid(error):
    return redirect(url_for('.login', next=request.url))


@distributor_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if request.method == 'POST':
        if form.validate() and form.login():
            return jsonify({'accessGranted': True})
        return jsonify({'accessGranted': False, 'message': u'用户名或密码错误'})
    return render_template('distributor/login.html', form=form)


@distributor_blueprint.route('/logout')
@distributor_permission.require(403)
def logout():
    logout_user()
    identity_changed.send(current_app._get_current_object(), identity=AnonymousIdentity())
    return redirect(url_for('.login'))


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
    abort(403)


@distributor_blueprint.route('')
@distributor_permission.require(403)
def index():
    statistic = {
        'in_stock': Stock.query.filter_by(distributor_id=current_user.id).count()
    }
    return render_template('distributor/index.html', statistic=statistic, distributor=current_user)


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


@distributor_blueprint.route('/items')
@distributor_permission.require(403)
def items_stock():
    return render_template('distributor/items.html', distributor=current_user)


@distributor_blueprint.route('/items/datatable')
@distributor_permission.require(403)
def items_data_table():
    draw, start, length = data_table_params()
    query = Item.query.filter_by(vendor_id=current_user.vendor.id, is_deleted=False)
    items = query.offset(start).limit(length)
    data = {'draw': draw, 'recordsTotal': query.count(), 'recordsFiltered': query.count(), 'data': []}
    for item in items:
        stock = Stock.query.filter_by(distributor_id=current_user.id, item_id=item.id).first()
        data['data'].append({
            'id': item.id, 'item': item.item, 'second_category_id': item.second_category, 'price': item.price,
            'size': '%s*%s*%s' % (item.length, item.width, item.height), 'inventory': stock.stock if stock else 0
        })
    return jsonify(data)


@distributor_blueprint.route('/items/<int:item_id>', methods=['POST'])
@distributor_permission.require(403)
def item_stock(item_id):
    item = Item.query.get(item_id)
    if 'stock' not in request.form or request.form['stock'] not in ['0', '1']:
        return jsonify({'success': False, 'message': u'参数错误'})
    if not item or item.is_deleted or item.vendor_id != current_user.vendor.id:
        return jsonify({'success': False, 'message': u'无此商品'})
    stock = Stock.query.filter_by(item_id=item_id, distributor_id=current_user.id).first()
    if stock is None:
        stock = Stock(item.id, current_user.id, request.form['stock'])
    else:
        stock.stock = request.form['stock']
    db.session.add(stock)
    db.session.commit()
    return jsonify({'success': True})


@distributor_blueprint.route('/settings', methods=['GET', 'POST'])
@distributor_permission.require(403)
def settings():
    form = SettingsForm()
    if request.method == 'POST':
        if form.validate():
            form.update_settings()
    form.show_settings()
    return render_template('distributor/settings.html', form=form, distributor=current_user)
