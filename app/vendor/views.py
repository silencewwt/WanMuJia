# -*- coding: utf-8 -*-
import datetime
from functools import wraps

from flask import current_app, flash, render_template, redirect, request, session, url_for, jsonify
from flask.ext.login import login_user, logout_user, current_user
from flask.ext.principal import identity_changed, Identity, AnonymousIdentity

from app import db
from app.core import reset_password as model_reset_password
from app.models import Vendor, Item, Distributor
from app.permission import vendor_permission
from app.forms import MobileRegistrationForm
from app.constants import *
from app.utils import md5_with_time_salt
from app.utils.redis import redis_get, redis_set
from .import vendor as vendor_blueprint
from .forms import LoginForm, RegistrationDetailForm, ItemForm, SettingsForm, ItemImageForm, ItemImageSortForm, \
    ItemImageDeleteForm, RevocationForm, ReconfirmForm


def vendor_confirmed(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        if current_user.confirmed:
            return f(*args, **kwargs)
        return '尚未通过审核'
    return wrapped


def vendor_not_confirmed(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        if not current_user.confirmed:
            return f(*args, **kwargs)
        return '已通过审核, 无法修改'
    return wrapped


@vendor_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if request.method == 'POST':
        vendor = Vendor.query.filter_by(mobile=form.mobile.data).first() or \
            Vendor.query.filter_by(email=form.mobile.data).first()
        if form.validate() and vendor and vendor.verify_password(form.password.data):
            login_user(vendor)
            identity_changed.send(current_app._get_current_object(), identity=Identity(vendor.get_id()))
            if not vendor.confirmed:
                vendor.push_confirm_reminds('danger', '233333')
            return jsonify({ACCESS_GRANTED: True})
        return jsonify({ACCESS_GRANTED: False})
    return render_template('vendor/login.html', form=form)


@vendor_blueprint.route('/logout')
@vendor_permission.require()
def logout():
    logout_user()
    identity_changed.send(current_app._get_current_object(), identity=AnonymousIdentity())
    return redirect(url_for('.login'))


@vendor_blueprint.route('/register', methods=['GET', 'POST'])
def register():
    mobile_form = MobileRegistrationForm()
    detail_form = RegistrationDetailForm()
    if VENDOR_REGISTER_STEP_DONE in session:
        if session[VENDOR_REGISTER_STEP_DONE] == 0:
            if request.method == 'POST':
                if mobile_form.validate():
                    session[VENDOR_REGISTER_MOBILE] = mobile_form.mobile.data
                    session[VENDOR_REGISTER_STEP_DONE] = 1
                    return jsonify({ACCESS_GRANTED: True})
                return jsonify({ACCESS_GRANTED: False, 'message': mobile_form.error2str()})
            else:
                return render_template('vendor/register.html', form=mobile_form)
        elif session[VENDOR_REGISTER_STEP_DONE] == 1:
            if request.method == 'POST':
                if detail_form.validate():
                    vendor = detail_form.add_vendor(session[VENDOR_REGISTER_MOBILE])
                    vendor.push_confirm_reminds('warning')
                    login_user(vendor)
                    identity_changed.send(current_app._get_current_object(), identity=Identity(vendor.get_id()))
                    session.pop(VENDOR_REGISTER_MOBILE)
                    session.pop(VENDOR_REGISTER_STEP_DONE)
                    return jsonify({ACCESS_GRANTED: True})
                return jsonify({ACCESS_GRANTED: False, 'message': detail_form.error2str()})
            else:
                return render_template('vendor/register_next.html', form=detail_form)
    session[VENDOR_REGISTER_STEP_DONE] = 0
    return render_template('vendor/register.html', form=mobile_form)


@vendor_blueprint.route('/reset_password', methods=['GET', 'POST'])
def reset_password():
    return model_reset_password(Vendor, 'vendor')


@vendor_blueprint.route('/')
@vendor_permission.require()
def index():
    return render_template('vendor/index.html', vendor=current_user)


@vendor_blueprint.route('/items')
@vendor_permission.require()
@vendor_confirmed
def item_list():
    return render_template('vendor/items.html', vendor=current_user)


@vendor_blueprint.route('/items/datatable')
@vendor_permission.require()
def items_data_table():
    draw = request.args.get('draw', 1, type=int)
    start = request.args.get('start', 0, type=int)
    length = request.args.get('length', 100, type=int)
    valid_length = [10, 25, 50, 100]
    length = length if length in valid_length else valid_length[0]
    items = Item.query.filter_by(vendor_id=current_user.id, is_deleted=False).offset(start).limit(length)
    data = {'draw': draw, 'recordsTotal': Item.query.filter_by(is_deleted=False).count(),
            'recordsFiltered': items.count(), 'data': []}
    for item in items:
        data['data'].append({
            'id': item.id, 'item': item.item, 'second_category_id': item.second_category,
            'price': item.price, 'size': '%s*%s*%s' % (item.length, item.width, item.height)})
    return jsonify(data)


@vendor_blueprint.route('/items/<int:item_id>', methods=['GET', 'PUT', 'DELETE'])
@vendor_permission.require()
@vendor_confirmed
def item_detail(item_id):
    item = Item.query.get_or_404(item_id)
    if item.vendor_id != current_user.id:
        return 'forbidden', 403
    form = ItemForm()
    form.generate_choices()
    if request.method == 'GET':
        form.show_item(item)
        distributors = item.in_stock_distributors()
        return render_template('vendor/edit.html', form=form, item=item, distributors=distributors, vendor=current_user)
    elif request.method == 'PUT':
        if form.validate():
            form.update_item(item)
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': form.error2str()})
    elif request.method == 'DELETE':
        item.is_deleted = True
        db.session.add(item)
        db.session.commit()
        return jsonify({'success': True})


@vendor_blueprint.route('/items/new_item', methods=['GET', 'POST'])
@vendor_permission.require()
@vendor_confirmed
def new_item():
    form = ItemForm()
    form.generate_choices()
    if request.method == 'POST':
        if form.validate():
            item = form.add_item(current_user.id)
            return jsonify({'success': True, 'item_id': item.id})
        return jsonify({'success': False, 'message': form.error2str()})
    return render_template('vendor/new_item.html', form=form, vendor=current_user)


@vendor_blueprint.route('/items/image', methods=['PUT', 'DELETE'])
@vendor_permission.require()
@vendor_confirmed
def upload_item_image():
    if request.method == 'PUT':
        form = ItemImageForm(csrf_enabled=False)
        form.item_id.data = request.args.get('item_id', 0, type=int)
        if form.validate():
            return jsonify({'success': True, 'image': form.add_item_image()})
        return jsonify({'success': False, 'message': form.error2str()})
    else:
        form = ItemImageDeleteForm(csrf_enabled=False)
        if 'image_hash' not in request.form:
            return '', 403
        form.image_hash.data = request.form['image_hash']
        if form.validate():
            form.delete_image()
            return 'ok', 200
        return 'fail', 403


@vendor_blueprint.route('/items/image_sort', methods=['POST'])
@vendor_permission.require()
@vendor_confirmed
def update_item_image_sort():
    form = ItemImageSortForm(csrf_enabled=False)
    if form.validate():
        form.update_item_image_sort()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': form.error2str()})


@vendor_blueprint.route('/distributors', methods=['GET', 'POST'])
@vendor_permission.require()
@vendor_confirmed
def distributor_list():
    form = RevocationForm()
    if request.method == 'POST':
        if form.validate_on_submit():
            form.revoke()
            return 'ok', 200
        return '', 500
    return render_template('vendor/distributors.html', vendor=current_user, form=form)


@vendor_blueprint.route('/distributors/datatable')
@vendor_permission.require()
def distributors_data_table():
    draw = request.args.get('draw', 1, type=int)
    start = request.args.get('start', 0, type=int)
    length = request.args.get('length', 100, type=int)
    valid_length = [10, 25, 50, 100]
    length = length if length in valid_length else valid_length[0]
    distributors = Distributor.query.filter_by(vendor_id=current_user.id).offset(start).limit(length)
    data = {'draw': draw, 'recordsTotal': Distributor.query.count(), 'recordsFiltered': distributors.count(),
            'data': []}
    for distributor in distributors:
        created = datetime.datetime.fromtimestamp(distributor.created).strftime('%F')
        data['data'].append({
            'id': distributor.id, 'name': distributor.name, 'contact_mobile': distributor.mobile, 'created': created,
            'contact_telephone': distributor.telephone, 'contact': distributor.contact,
            'revocation_state': distributor.revocation_state, 'address': distributor.address.precise_address()})
    return jsonify(data)


@vendor_blueprint.route('/distributors/invitation', methods=['GET', 'POST'])
@vendor_permission.require()
@vendor_confirmed
def invite_distributor():
    if request.method == 'POST':
        token = md5_with_time_salt(current_user.id)
        redis_set(DISTRIBUTOR_REGISTER, token, current_user.id)
        return 'http://%s/distributor/verify?token=%s' % ('www.wanmujia.com', token)   # TODO: host
    return render_template('vendor/invitation.html', vendor=current_user)


@vendor_blueprint.route('/distributors/<int:distributor_id>/revocation', methods=['POST'])
@vendor_permission.require()
@vendor_confirmed
def revocation(distributor_id):
    distributor = Distributor.query.get_or_404(distributor_id)
    if distributor.vendor_id != current_user.id:
        return 'forbidden', 403
    form = RevocationForm()
    form.distributor_id.data = distributor.id
    if form.validate_on_submit():
        form.revoke()
    return redirect(url_for('.distributor_list'))


@vendor_blueprint.route('/settings', methods=['GET', 'POST'])
@vendor_permission.require()
def settings():
    form = SettingsForm()
    if request.method == 'POST':
        if form.validate():
            form.update_vendor_setting(current_user)
    form.show_vendor_setting(current_user)
    return render_template('vendor/settings.html', form=form, vendor=current_user)


@vendor_blueprint.route('/reconfirm', methods=['GET', 'POST'])
@vendor_permission.require()
@vendor_not_confirmed
def reconfirm():
    form = ReconfirmForm()
    if request.method == 'GET':
        form.show_info()
        return render_template('vendor/register_next.html', form=form, vendor=current_user)
    else:
        if form.validate():
            form.reconfirm()
        flash(u'something wrong')
        return redirect(url_for('.reconfirm'))
