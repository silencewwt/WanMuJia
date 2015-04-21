# -*-coding: utf-8 -*-
from flask import current_app, request, render_template, redirect, flash
from flask_security import login_user, logout_user, login_required
from flask_security.utils import identity_changed, Identity

from . import user as user_blueprint
from . forms import *
from app import db
from app.models import User
from app.constants import *
from app.permission import user_permission
from app.utils.captcha import send_sms_captcha
from app.utils.validator import available_mobile
from app.utils.utils import md5_with_salt
from app.utils.redis import redis_set, redis_get


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
    form = RegistrationForm()
    if form.validate_on_submit():
        user = User(
            mobile=form.mobile.data,
            password=form.password.data,
            email=form.email.data
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)
        identity_changed.send(current_app._get_current_object(), Identity(user.get_id()))
        flash(u'注册成功!')
        return redirect('/')
    return render_template('user/register.html', register_form=form)


@user_blueprint.route('/send_sms', methods=['POST'])
def send_sms():
    # TODO: CSRF Token
    # TODO: verify image captcha
    mobile = request.values.get('mobile', '', type=str)
    if available_mobile(mobile):
        send_sms_captcha(mobile)
        return 'ok', 200
    return 'false', 401


@user_blueprint.route('/reg_email', methods=['POST'])
def send_register_email():
    # TODO: CSRF Token
    form = EmailRegistrationForm()
    if form.validate_on_submit():
        token = md5_with_salt(form.email.data)
        redis_set(CONFIRM_EMAIL, token, None, email=form.email.data, password=form.password.data, action='register')
        return 'ok', 200
    return 'false', 401


@user_blueprint.route('/verify')
def verify_email():
    token = request.args.get('token', '', type=str)
    action = request.args.get('action', '', type=str)
    user_info = redis_get(CONFIRM_EMAIL, token)
    if user_info and user_info['action'] == action:
        if action == REGISTER_ACTION:
            user = User(
                password=user_info['password'],
                mobile='',
                email=user_info['email'],
            )
            db.session.add(user)
            db.session.commit()
            login_user(user)
            identity_changed.send(current_app._get_current_object(), Identity(user.get_id()))
            return u'已激活'
        elif action == RESET_PASSWORD_ACTION:
            pass
    return u'激活链接已失效'


@user_blueprint.route('/reset_password', methods=['GET', 'POST'])
def reset_password():
    pass