# -*- coding: utf-8 -*-
from flask import current_app, flash, render_template, redirect, request, session, url_for
from flask_security import login_user, logout_user, login_required, current_user
from flask_security.utils import identity_changed, Identity

from app import db
from app.core import login as model_login, reset_password as model_reset_password
from app.models import Vendor, Item, Distributor
from app.permission import vendor_permission
from app.forms import MobileRegistrationForm
from app.constants import *
from app.utils import md5_with_timestamp_salt
from app.utils.redis import redis_get, redis_set
from .import vendor as vendor_blueprint
from .forms import LoginForm, RegistrationDetailForm, ItemForm


@vendor_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        if model_login(Vendor, form):
            return redirect('/')    # TODO: redirect
        flash(u'用户名或密码错误!')
    return render_template('user/login.html', login_form=form)


@vendor_blueprint.route('/register', methods=['GET', 'POST'])
def register():
    form_type = request.args.get('form', '', type=str)
    mobile_form = MobileRegistrationForm()
    detail_form = RegistrationDetailForm()
    if VENDOR_REGISTER_STEP_DONE in session:
        if VENDOR_REGISTER_STEP_DONE == 0:
            if form_type == 'mobile' and mobile_form.validate_on_submit():
                session[VENDOR_REGISTER_MOBILE] = mobile_form.mobile.data
                session[VENDOR_REGISTER_STEP_DONE] = 1
                return 'step 2 page'
            return 'step 1 page'
        elif VENDOR_REGISTER_STEP_DONE == 1:
            if form_type == 'detail' and detail_form.validate_on_submit():
                vendor = detail_form.add_vendor(session[VENDOR_REGISTER_MOBILE])
                login_user(vendor)
                identity_changed.send(current_app._get_current_object(), Identity(vendor.get_id()))
                session.pop(VENDOR_REGISTER_MOBILE)
                session.pop(VENDOR_REGISTER_STEP_DONE)
                return 'register done'
            return 'step 2 page'
    session[VENDOR_REGISTER_STEP_DONE] = 0
    return 'step 1 page'


@vendor_blueprint.route('/reset_password', methods=['GET', 'POST'])
def reset_password():
    return model_reset_password(Vendor, 'vendor')


@vendor_blueprint.route('/items', methods=['GET', 'POST', 'PUT', 'DELETE'])
@vendor_permission.require()
def item_list():
    # TODO: upload images
    form = ItemForm()
    form.generate_choices()
    item_id = request.args.get('item', 0, int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 100, type=int)
    if item_id:
        item = Item.query.get_or_404(item_id)
        if item.vendor_id != current_user.id:
            return 'forbidden', 403
        if request.method == 'GET':
            form.show_item(item)
            return render_template('vendor/detail.html', item=item)
        elif request.method == 'PUT':
            if form.validate_on_submit():
                form.update_item(item)
                return redirect(url_for('.items', item=item.id))
            flash('something wrong')
            return 'something wrong'
        elif request.method == 'DELETE':
            db.session.delete(item)
            db.session.commit()
            return 'delete item successfully'
    else:
        if request.method == 'GET':
            items = Item.query.filter_by(vendor_id=current_user.id).paginate(page, per_page, False).items
            return render_template('vendor/items.html', items=items)
        elif request.method == 'POST':
            if form.validate_on_submit():
                item = form.add_item(current_user.id)
                return redirect(url_for('.items', item=item.id))
            return 'add item fail'