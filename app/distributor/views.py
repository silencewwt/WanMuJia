# -*- coding: utf-8 -*-
from flask import current_app, render_template, request, redirect, session
from flask_security import login_user, logout_user, current_user
from flask_security.utils import identity_changed, Identity

from app import db
from app.core import login as model_login
from app.models import Distributor, Vendor
from app.permission import distributor_permission
from . import distributor as distributor_blueprint
from .forms import LoginForm, RegisterForm


@distributor_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        if model_login(Distributor, form):
            return redirect('/')    # TODO: redirect
    return render_template('distributor/login.html', login_form=form)


@distributor_blueprint.route('/register', methods=['GET', 'POST'])
def register():
    if 'register_permission' in session and session['register_permission'] and \
            'vendor_id' in session and Vendor.get(session['vendor_id']):
        form = RegisterForm()
        if form.validate_on_submit():
            distributor = form.add_distributor(session['vendor_id'])
            login_user(distributor)
            identity_changed.send(current_app._get_current_object(), Identity(distributor.get_id()))
            session.pop('register_permission')
            session.pop('vendor_id')
            return u'success'   # TODO: redirect
        return render_template('distributor/register.html', register_form=form)
    return 'error', 403


@distributor_blueprint.route('/verify')
def verify():
    pass
