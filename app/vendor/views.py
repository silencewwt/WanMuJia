# -*- coding: utf-8 -*-
import datetime
import json
from functools import wraps

from flask import current_app, render_template, redirect, request, session, url_for, jsonify, abort
from flask.ext.login import login_user, logout_user, current_user
from flask.ext.principal import identity_changed, Identity, AnonymousIdentity
from werkzeug.datastructures import ImmutableMultiDict

from app import db
from app.core import reset_password as model_reset_password
from app.models import Vendor, Item, Distributor
from app.permission import vendor_permission
from app.forms import MobileRegistrationForm
from app.constants import *
from app.utils import md5_with_time_salt, DataTableHandler
from app.utils.redis import redis_set
from app.wmj_email import ADMIN_REMINDS, ADMIN_REMINDS_SUBJECT, send_email
from . import vendor as vendor_blueprint
from .forms import LoginForm, RegistrationDetailForm, ItemForm, SettingsForm, ItemImageForm, ItemImageSortForm, \
    ItemImageDeleteForm, RevocationForm, ReconfirmForm, InitializationForm, SuiteForm, ComponentForm


def vendor_confirmed(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        if current_user.is_authenticated and current_user.confirmed:
            return f(*args, **kwargs)
        return '尚未通过审核'
    return wrapped


def vendor_item_permission(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        if current_user.is_authenticated and current_user.item_permission:
            return f(*args, **kwargs)
        return '尚未通过审核, 无法上传商品'
    return wrapped


@vendor_blueprint.errorhandler(401)
def forbid(error):
    return redirect(url_for('.login', next=request.url))


@vendor_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if request.method == 'POST':
        vendor = Vendor.query.filter_by(mobile=form.mobile.data).first() or \
            Vendor.query.filter_by(email=form.mobile.data).first()
        if form.validate() and vendor and vendor.verify_password(form.password.data):
            login_user(vendor)
            identity_changed.send(current_app._get_current_object(), identity=Identity(vendor.get_id()))
            if not vendor.info_completed:
                vendor.push_confirm_reminds(VENDOR_REMINDS_COMPLETE)
            elif not vendor.confirmed and vendor.rejected:
                vendor.push_confirm_reminds(VENDOR_REMINDS_REJECTED, vendor.reject_message)
            elif not vendor.confirmed and not vendor.rejected:
                vendor.push_confirm_reminds(VENDOR_REMINDS_PENDING)
            return jsonify({ACCESS_GRANTED: True})
        return jsonify({ACCESS_GRANTED: False})
    return render_template('vendor/login.html', form=form)


@vendor_blueprint.route('/logout')
@vendor_permission.require(401)
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
                    vendor.push_confirm_reminds(VENDOR_REMINDS_PENDING)
                    login_user(vendor)
                    identity_changed.send(current_app._get_current_object(), identity=Identity(vendor.get_id()))
                    send_email(current_app.config['ADMIN_EMAILS'], ADMIN_REMINDS_SUBJECT, ADMIN_REMINDS)
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
@vendor_permission.require(401)
def index():
    if not current_user.initialized:
        return redirect(url_for('.initialization'))
    return render_template('vendor/index.html', vendor=current_user)


@vendor_blueprint.route('/items')
@vendor_permission.require(401)
@vendor_item_permission
def item_list():
    return render_template('vendor/items.html', vendor=current_user)


@vendor_blueprint.route('/items/datatable')
@vendor_permission.require(401)
def items_data_table():
    params = {
        'id': {'orderable': False, 'data': lambda x: x.id},
        'item': {'orderable': False, 'data': lambda x: x.item},
        'scene_id': {'orderable': False, 'data': lambda x: x.scene},
        'price': {'orderable': True, 'order_key': Item.price, 'data': lambda x: x.price},
        'size': {'orderable': False, 'data': lambda x: x.size()}}
    query = Item.query.filter_by(vendor_id=current_user.id, is_deleted=False, is_component=False)
    data_table_handler = DataTableHandler(params)
    data = data_table_handler.query_params(query)
    return jsonify(data)


@vendor_blueprint.route('/items/<int:item_id>', methods=['GET', 'PUT', 'DELETE'])
@vendor_permission.require(401)
@vendor_item_permission
def item_detail(item_id):
    item = Item.query.get_or_404(item_id)
    if item.vendor_id != current_user.id:
        return 'forbidden', 403
    elif item.is_deleted:
        abort(404)

    if not item.is_suite and not item.is_component:
        form = ItemForm()
        form.generate_choices()
        if request.method == 'GET':
            form.show_item(item)
            return render_template('vendor/edit_single.html', form=form, item=item, vendor=current_user)

        elif request.method == 'PUT':
            if form.validate():
                form.update_item(item)
            else:
                return jsonify({'success': False, 'message': form.error2str()})

        elif request.method == 'DELETE':
            item.is_deleted = True
        db.session.commit()
        return jsonify({'success': True})

    elif item.is_suite and not item.is_component:
        suite = item
        form = SuiteForm()
        form.generate_choices()
        if request.method == 'GET':
            form.show_suite(suite)
            component_forms = []
            for component in suite.components:
                component_form = ComponentForm()
                component_form.generate_choices()
                component_form.show_component(component)
                component_forms.append(component_form)
            return render_template('vendor/edit_suite.html',
                                   form=form, item=suite, com_forms=component_forms, vendor=current_user)

        elif request.method == 'PUT':
            if not form.validate():
                return jsonify({'success': False, 'message': form.error2str()})
            component_forms = []
            if 'components' in request.form:
                json_components = json.loads(request.form['components'])
                for json_component in json_components:
                    component_form = ComponentForm(suite_id=suite.id, formdata=ImmutableMultiDict(json_component), csrf_enabled=False)
                    component_form.generate_choices()
                    if not component_form.validate():
                        return jsonify({'success': False, 'message': component_form.error2str()})
                    component_forms.append(component_form)
            if not component_forms:
                return jsonify({'success': False, 'message': '请添加至少一个组件'})
            form.update_suite(suite)
            for component_form in component_forms:
                if component_form.component_id.data:
                    component_form.update()
                else:
                    component_form.add_component(current_user.id, suite.id)
            if 'del_components' in request.form:
                del_components = set()
                for component in suite.components:
                    if str(component.id) in request.form['del_components']:
                        del_components.add(component)
                if len(del_components) == suite.components.count():
                    return jsonify({'success': False, 'message': '不能删除所有组件!'})
                for component in del_components:
                    component.is_deleted = True
            suite.update_suite_amount()

        elif request.method == 'DELETE':
            suite.is_deleted = True
            for component in suite.components:
                component.is_deleted = True
        db.session.commit()
        return jsonify({'success': True})
    else:
        abort(404)


@vendor_blueprint.route('/items/new_item', methods=['GET', 'POST'])
@vendor_permission.require(401)
@vendor_item_permission
def new_item():
    item_type = request.args.get('type')
    if item_type == 'single':
        form = ItemForm()
        form.generate_choices()
        if request.method == 'POST':
            if form.validate():
                item = form.add_item(current_user.id)
                return jsonify({'success': True, 'item_id': item.id})
            return jsonify({'success': False, 'message': form.error2str()})
        return render_template('vendor/new_item_single.html', form=form, vendor=current_user)
    elif item_type == 'suite':
        suite_form = SuiteForm()
        suite_form.generate_choices()
        if request.method == 'POST':
            if not suite_form.validate():
                return jsonify({'success': False, 'message': suite_form.error2str()})

            component_forms = []
            if 'components' in request.form:
                json_components = json.loads(request.form['components'])
                for json_component in json_components:
                    component_form = ComponentForm(csrf_enabled=False, formdata=ImmutableMultiDict(json_component))
                    component_form.generate_choices()
                    if not component_form.validate():
                        return jsonify({'success': False, 'message': component_form.error2str()})
                    component_forms.append(component_form)
            if not component_forms:
                return jsonify({'success': False, 'message': '请添加至少一个组件'})
            suite = suite_form.add_suite(current_user.id)
            for component_form in component_forms:
                component_form.add_component(current_user.id, suite.id)
            suite.update_suite_amount()
            return jsonify({'success': True, 'item_id': suite.id})
        component_form = ComponentForm()
        component_form.generate_choices()
        return render_template('vendor/new_item_suite.html',
                               form=suite_form, com_form=component_form, vendor=current_user)
    else:
        abort(404)


@vendor_blueprint.route('/items/image', methods=['PUT', 'DELETE'])
@vendor_permission.require(401)
@vendor_item_permission
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
            return jsonify({'success': False})
        form.image_hash.data = request.form['image_hash']
        if form.validate():
            form.delete_image()
            return jsonify({'success': True})
        return jsonify({'success': False})


@vendor_blueprint.route('/items/image_sort', methods=['POST'])
@vendor_permission.require(401)
@vendor_item_permission
def update_item_image_sort():
    form = ItemImageSortForm(csrf_enabled=False)
    if form.validate():
        form.update_item_image_sort()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': form.error2str()})


@vendor_blueprint.route('/distributors', methods=['GET', 'POST'])
@vendor_permission.require(401)
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
@vendor_permission.require(401)
def distributors_data_table():
    params = {
        'id': {'orderable': False, 'data': lambda x: x.id},
        'name': {'orderable': False, 'data': lambda x: x.name},
        'contact_mobile': {'orderable': False, 'data': lambda x: x.contact_mobile},
        'created': {'orderable': False, 'data': lambda x: datetime.datetime.fromtimestamp(x.created).strftime('%F')},
        'contact_telephone': {'orderable': False, 'data': lambda x: x.contact_telephone},
        'contact': {'orderable': False, 'data': lambda x: x.contact},
        'revocation_state': {'orderable': False, 'data': lambda x: x.revocation_state},
        'address': {'orderable': False, 'data': lambda x: x.address.precise_address()}
    }
    query = Distributor.query.filter_by(vendor_id=current_user.id)
    data_table_handler = DataTableHandler(params)
    data = data_table_handler.query_params(query)
    return jsonify(data)


@vendor_blueprint.route('/distributors/invitation', methods=['GET', 'POST'])
@vendor_permission.require(401)
@vendor_confirmed
def invite_distributor():
    if request.method == 'POST':
        token = md5_with_time_salt(current_user.id)
        redis_set(DISTRIBUTOR_REGISTER, token, current_user.id)
        return url_for('distributor.verify', token=token, _external=True)
    return render_template('vendor/invitation.html', vendor=current_user)


@vendor_blueprint.route('/distributors/<int:distributor_id>/revocation', methods=['POST'])
@vendor_permission.require(401)
@vendor_confirmed
def revocation(distributor_id):
    distributor = Distributor.query.get_or_404(distributor_id)
    if distributor.vendor_id != current_user.id:
        return 'forbidden', 401
    form = RevocationForm()
    form.distributor_id.data = distributor.id
    if form.validate_on_submit():
        form.revoke()
    return redirect(url_for('.distributor_list'))


@vendor_blueprint.route('/settings', methods=['GET', 'POST'])
@vendor_permission.require(401)
def settings():
    if not current_user.confirmed:
        return redirect(url_for('.reconfirm'))
    form = SettingsForm(current_user)
    if request.method == 'POST':
        if form.validate():
            form.update_vendor_setting(current_user)
    form.show_vendor_setting(current_user)
    return render_template('vendor/settings.html', form=form, vendor=current_user)


@vendor_blueprint.route('/initialization', methods=['GET', 'POST'])
@vendor_permission.require(401)
def initialization():
    if current_user.initialized:
        return redirect(url_for('.index'))
    form = InitializationForm()
    if request.method == 'GET':
        return render_template('vendor/initialization.html', form=form, vendor=current_user)
    else:
        if form.validate():
            form.initial()
            return jsonify({'success': True})
        return jsonify({'success': False, 'message': form.error2str()})


@vendor_blueprint.route('/reconfirm', methods=['GET', 'POST'])
@vendor_permission.require(401)
def reconfirm():
    if current_user.confirmed:
        return redirect(url_for('.settings'))
    form = ReconfirmForm()
    if request.method == 'GET':
        form.show_info()
        return render_template('vendor/register_next.html', form=form, vendor=current_user)
    else:
        if form.validate():
            form.reconfirm()
            return jsonify({'accessGranted': True})
        return jsonify({'accessGranted': False, 'message': form.error2str()})
