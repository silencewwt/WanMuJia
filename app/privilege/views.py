# -*- coding: utf-8 -*-
from flask import request, render_template, current_app, flash, redirect, url_for, jsonify

from app.constants import ACCESS_GRANTED
from app.models import Vendor, DistributorRevocation
from app.permission import privilege_permission
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
    return render_template('admin/index.html')


@privilege_blueprint.route('/vendor_confirm')
@privilege_permission.require()
def vendor_confirm():
    vendors = Vendor.query.filter_by(confirmed=False, rejected=False).all()
    return render_template('admin/vendor_confirm.html', vendors=vendors)


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


@privilege_blueprint.route('/distributors/revocation', methods=['GET, POST'])
@privilege_permission.require()
def distributors_revocation():
    revocations = DistributorRevocation.query.filter_by(pending=True)
    form = DistributorRevocationForm()
    if form.validate_on_submit():
        form.revoke()
        return redirect(url_for('.distributors_revocation'))
    return render_template('admin/distributors_revocation.html', form=form, revocations=revocations)
