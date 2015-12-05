# -*- coding: utf-8 -*-
from flask import current_app, render_template, request, redirect, session, url_for, jsonify, abort
from flask.ext.login import login_user, logout_user, current_user
from flask.ext.principal import identity_changed, Identity, AnonymousIdentity

from app import db
from app.models import Vendor, Stock, Item
from app.constants import DISTRIBUTOR_REGISTER
from app.permission import distributor_permission
from app.utils import DataTableHandler
from app.utils.redis import redis_get
from . import distributor as distributor_blueprint
from .forms import LoginForm, RegisterForm, SettingsForm


@distributor_blueprint.errorhandler(401)
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
@distributor_permission.require(401)
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
    abort(401)


@distributor_blueprint.route('/')
@distributor_permission.require(401)
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
@distributor_permission.require(401)
def items_stock():
    return render_template('distributor/items.html', distributor=current_user)


@distributor_blueprint.route('/items/datatable')
@distributor_permission.require(401)
def items_data_table():
    def handle_stock(item):
        stock = Stock.query.filter_by(distributor_id=current_user.id, item_id=item.id).first()
        return stock.stock if stock else 0

    params = {
        'id': {'orderable': False, 'data': lambda x: x.id},
        'item': {'orderable': False, 'data': lambda x: x.item},
        'second_material_id': {'orderable': False, 'data': lambda x: x.second_material},
        'scene_id': {'orderable': False, 'data': lambda x: x.scene},
        'size': {'orderable': False, 'data': lambda x: x.size},
        'price': {'orderable': True, 'order_key': Item.price, 'data': lambda x: x.price},
        'inventory': {'orderable': False, 'data': handle_stock}
    }
    query = Item.query.filter_by(vendor_id=current_user.vendor.id, is_deleted=False, is_component=False)
    data_table_handler = DataTableHandler(params)
    data = data_table_handler.query_params(query)
    return jsonify(data)


@distributor_blueprint.route('/items/<int:item_id>', methods=['POST'])
@distributor_permission.require(401)
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
@distributor_permission.require(401)
def settings():
    form = SettingsForm()
    if request.method == 'POST':
        if form.validate():
            form.update_settings()
    form.show_settings()
    return render_template('distributor/settings.html', form=form, distributor=current_user)
