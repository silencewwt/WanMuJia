# -*-coding: utf-8 -*-
from flask import current_app, request, render_template, redirect, flash
from flask_security import login_user, logout_user, login_required
from flask_security.utils import identity_changed, Identity

from . import user as user_blueprint
from . forms import LoginForm
from .. import db
from ..models import User
from ..permission import user_permission


@user_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    login_form = LoginForm()
    if login_form.validate_on_submit():
        user = User.query.filter_by(username=login_form.username.data).first() or \
            User.query.filter_by(mobile=login_form.username.data).first() or \
            User.query.filter_by(email=login_form.username.data).first()
        if user and user.verify_password(login_form.username.data):
            login_user(user, login_form.remember_me.data)
            identity_changed.send(current_app._get_current_object(), Identity(user.get_id()))
            return redirect('/')    # TODO: redirect
        flash(u'用户名或密码错误')
    return render_template('user/login.html', login_form=login_form)


@user_blueprint.route('/register', methods=['GET', 'POST'])
def register():
    pass