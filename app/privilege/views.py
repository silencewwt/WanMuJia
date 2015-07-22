# -*- coding: utf-8 -*-
import datetime
from flask import request, render_template, current_app, redirect, url_for, jsonify

from app.constants import ACCESS_GRANTED
from app.models import Vendor, DistributorRevocation, Item, Distributor
from app.permission import privilege_permission
from app.utils import data_table_params
from . import privilege as privilege_blueprint
from .forms import LoginForm, VendorConfirmForm, VendorConfirmRejectForm, DistributorRevocationForm


@privilege_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if request.method == 'POST':
        if form.validate() and form.login():
            return jsonify({ACCESS_GRANTED: True})
        return jsonify({ACCESS_GRANTED: False, 'message': u'用户名或密码错误.'})
    return render_template('admin/login.html', form=form)


@privilege_blueprint.route('/')
@privilege_permission.require()
def index():
    statistic = {
        'items': Item.query.filter_by(is_deleted=False).count(),
        'vendors': Vendor.query.filter_by(confirmed=True).count(),
        'distributors': Distributor.query.filter_by(is_revoked=False).count(),
        'vendors_to_confirm': Vendor.query.filter_by(confirmed=False, rejected=False).count(),
        'distributor_to_revoke': DistributorRevocation.query.filter_by(pending=True).count()
    }
    return render_template('admin/index.html', statistic=statistic)


@privilege_blueprint.route('/items')
@privilege_permission.require()
def item_list():
    return render_template('admin/items.html')


@privilege_blueprint.route('/items/datatable')
@privilege_permission.require()
def items_data_table():
    draw, start, length = data_table_params()
    items = Item.query.filter_by(is_deleted=False).offset(start).limit(length)
    data = {'draw': draw, 'recordsTotal': Item.query.filter_by(is_deleted=False).count(),
            'recordsFiltered': items.count(), 'data': []}
    for item in items:
        data['data'].append({
            'id': item.id, 'item': item.item, 'second_category_id': item.second_category, 'vendor': item.vendor.name,
            'price': item.price, 'size': '%s*%s*%s' % (item.length, item.width, item.height)})
    return jsonify(data)


@privilege_blueprint.route('/vendors')
@privilege_permission.require()
def vendor_list():
    return render_template('admin/vendors.html')


@privilege_blueprint.route('/vendors/datatable')
@privilege_permission.require()
def vendors_data_table():
    draw, start, length = data_table_params()
    vendors = Vendor.query.filter_by(confirmed=True).offset(start).limit(length)
    data = {'draw': draw, 'recordsTotal': Vendor.query.filter_by(confirmed=True).count(),
            'recordsFiltered': vendors.count(), 'data': []}
    for vendor in vendors:
        data['data'].append({
            'id': vendor.id, 'name': vendor.name, 'address': vendor.address.precise_address(),
            'license_limit': vendor.license_limit, 'mobile': vendor.mobile, 'telephone': vendor.telephone
        })
    return jsonify(data)


@privilege_blueprint.route('/vendor_confirm')
@privilege_permission.require()
def vendor_confirm():
    vendors = Vendor.query.filter_by(confirmed=False, rejected=False).all()
    return render_template('admin/confirm.html', vendors=vendors)


@privilege_blueprint.route('vendor_confirm/datatable')
@privilege_permission.require()
def vendors_datatable():
    pass


@privilege_blueprint.route('/vendor_confirm/reject', methods=['POST'])
@privilege_permission.require()
def vendor_confirm_reject():
    form = VendorConfirmRejectForm()
    if form.validate():
        form.reject_vendor()
        return 'rejected'
    return 'invalidate vendor id'


@privilege_blueprint.route('/vendor_confirm/pass', methods=['POST'])
@privilege_permission.require()
def vendor_confirm_pass():
    form = VendorConfirmForm(csrf_enabled=False)
    if form.validate():
        form.pass_vendor()
        return 'passed'
    return 'invalidate vendor id'


@privilege_blueprint.route('/distributors')
@privilege_permission.require()
def distributor_list():
    return render_template('admin/distributors.html')


@privilege_blueprint.route('/distributors/datatable')
@privilege_permission.require()
def distributors_data_table():
    draw, start, length = data_table_params()
    distributors = Distributor.query.offset(start).limit(length)
    data = {'draw': draw, 'recordsTotal': Distributor.query.count(), 'recordsFiltered': distributors.count(),
            'data': []}
    for distributor in distributors:
        created = datetime.datetime.fromtimestamp(distributor.created).strftime('%F')
        data['data'].append({
            'id': distributor.id, 'name': distributor.name, 'contact_mobile': distributor.mobile, 'created': created,
            'contact_telephone': distributor.telephone, 'contact': distributor.contact,
            'revocation_state': distributor.revocation_state, 'address': distributor.address.precise_address()})
    return jsonify(data)


@privilege_blueprint.route('/distributors/revocation', methods=['GET, POST'])
@privilege_permission.require()
def distributors_revocation():
    revocations = DistributorRevocation.query.filter_by(pending=True)
    form = DistributorRevocationForm()
    if form.validate_on_submit():
        form.revoke()
        return redirect(url_for('.distributors_revocation'))
    return render_template('admin/distributors_revocation.html', form=form, revocations=revocations)
