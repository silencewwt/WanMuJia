# -*-coding: utf-8 -*-
from flask import current_app, request, render_template, redirect, flash, session, url_for
from flask_security import login_user, logout_user, login_required, current_user
from flask_security.utils import identity_changed, Identity

from . import user as user_blueprint
from . forms import *
from app import db
from app.models import User, Collection
from app.constants import *
from app.core import login as model_login, reset_password as model_reset_password
from app.permission import user_permission
from app.utils.captcha_ import send_sms_captcha
from app.utils.validator import available_mobile, validate_mobile
from app.utils.utils import md5_with_salt
from app.utils.redis import redis_set, redis_get


@user_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    login_form = LoginForm()
    if login_form.validate_on_submit():
        if model_login(User, login_form):
            return redirect('/')    # TODO: redirect
        flash(u'用户名或密码错误')
    return render_template('user/login.html', login_form=login_form)


@user_blueprint.route('/register', methods=['GET', 'POST'])
def register():
    form_type = request.args.get('form', '', type=str)
    mobile_form = MobileRegistrationForm()
    email_form = EmailRegistrationForm()
    detail_form = RegistrationDetailForm()
    if USER_REGISTER_STEP_DONE in session:
        if session[USER_REGISTER_STEP_DONE] == 0:
            if form_type == USER_REGISTER_MOBILE and mobile_form.validate_on_submit():
                session[USER_REGISTER_STEP_DONE] = 1
                session[USER_REGISTER_MOBILE] = mobile_form.mobile.data
            elif form_type == USER_REGISTER_EMAIL and email_form.validate_on_submit():
                session[USER_REGISTER_STEP_DONE] = 1
                session[USER_REGISTER_EMAIL] = email_form.email.data
            else:
                # TODO: step 1 page
                return 'step 1 page'
        elif session[USER_REGISTER_STEP_DONE] == 1 and detail_form.validate_on_submit():
            if USER_REGISTER_MOBILE in session and session[USER_REGISTER_MOBILE]:
                mobile = session[USER_REGISTER_MOBILE]
                email = ''
            elif USER_REGISTER_EMAIL in session and session[USER_REGISTER_EMAIL]:
                mobile = ''
                email = session[USER_REGISTER_EMAIL]
            else:
                return 'error', 401
            user = User(
                password=detail_form.password.data,
                mobile=mobile,
                email=email,
                username=detail_form.username.data
            )
            db.session.add(user)
            db.session.commit()
            login_user(user)
            identity_changed.send(current_app._get_current_object(), Identity(user.get_id()))
            flash(u'注册成功!')
            session.pop(USER_REGISTER_STEP_DONE)
            if mobile:
                session.pop(USER_REGISTER_MOBILE)
            if email:
                session.pop(USER_REGISTER_EMAIL)
            return redirect('/')
        elif session[USER_REGISTER_STEP_DONE] == 1 and not detail_form.validate_on_submit():
            # TODO: step 2 page
            return 'step 2 page'
    session[USER_REGISTER_STEP_DONE] = 0
    return render_template('user/register.html', mobile_form=mobile_form, email_form=email_form, detail_form=detail_form)


@user_blueprint.route('/send_sms', methods=['POST'])
def send_sms():
    # TODO: CSRF Token
    # TODO: verify image captcha
    mobile = request.values.get('mobile', '', type=str).strip()
    if validate_mobile(mobile):
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


@user_blueprint.route('/verify', methods=['GET', 'POST'])
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
            session['reset'] = True
            session['email'] = user_info['email']
            return redirect(url_for('reset_password'))
    return u'激活链接已失效'


@user_blueprint.route('/reset_password', methods=['GET', 'POST'])
def reset_password():
    return model_reset_password(User, 'user')


@user_blueprint.route('/collection', methods=['GET', 'POST', 'DELETE'])
# @user_permission.require()
def collection():
    if request.method == 'GET':
        page = request.args.get('page', 1, type=int)
        collections = Collection.query.filter_by(user_id=current_user.id).paginate(page, 50, False).items
        return render_template('/user/collection.html', collections=collections)

    item_id = request.form.get('item', 0, type=int)
    item_collection = Collection.query.filter_by(user_id=current_user.id, item_id=item_id).first()
    if request.method == 'POST':
        if not item_collection:
            item_collection = Collection(current_user.id, item_id)
            db.session.add(item_collection)
            db.session.commit()
        return 'ok', 200
    else:  # DELETE
        if item_collection:
            db.session.delete(item_collection)
            db.session.commit()
        return 'ok', 200