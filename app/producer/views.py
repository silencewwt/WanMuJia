# -*- coding: utf-8 -*-
from flask import current_app, flash, render_template, redirect, request, session
from flask_security import login_user, logout_user, login_required, current_user
from flask_security.utils import identity_changed, Identity

from app import db
from app.core import login as model_login, reset_password as model_reset_password
from app.models import Producer, Item
from app.permission import producer_permission
from app.forms import MobileRegistrationForm
from app.constants import *
from .import producer as producer_blueprint
from .forms import LoginForm, RegistrationDetailForm, ItemForm


@producer_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        if model_login(Producer, form):
            return redirect('/')    # TODO: redirect
        flash(u'用户名或密码错误!')
    return render_template('user/login.html', login_form=form)


@producer_blueprint.route('/register', methods=['GET', 'POST'])
def register():
    form_type = request.args.get('form', '', type=str)
    mobile_form = MobileRegistrationForm()
    detail_form = RegistrationDetailForm()
    if PRODUCER_REGISTER_STEP_DONE in session:
        if PRODUCER_REGISTER_STEP_DONE == 0:
            if form_type == 'mobile' and mobile_form.validate_on_submit():
                session[PRODUCER_REGISTER_MOBILE] = mobile_form.mobile.data
                session[PRODUCER_REGISTER_STEP_DONE] = 1
                return 'step 2 page'
            return 'step 1 page'
        elif PRODUCER_REGISTER_STEP_DONE == 1:
            if form_type == 'detail' and detail_form.validate_on_submit():
                producer = detail_form.add_producer(session[PRODUCER_REGISTER_MOBILE])
                login_user(producer)
                identity_changed.send(current_app._get_current_object(), Identity(producer.get_id()))
                session.pop(PRODUCER_REGISTER_MOBILE)
                session.pop(PRODUCER_REGISTER_STEP_DONE)
                return 'register done'
            return 'step 2 page'
    session[PRODUCER_REGISTER_STEP_DONE] = 0
    return 'step 1 page'


@producer_blueprint.route('/list', methods=['GET', 'POST'])
@producer_permission.require()
def item_list():
    form = ItemForm()
    if form.validate_on_submit():
        pass
    page = request.args.get('page', 1, type=int)
    items = Item.query.filter_by(producer_id=current_user.id).paginate(page, 100, False).items
    return render_template('producer/list.html', items=items)