# -*- coding: utf-8 -*-
from math import ceil
from flask import current_app, request, render_template, redirect, flash, session, url_for, jsonify
from flask.ext.login import login_user, logout_user, current_user
from flask.ext.principal import identity_changed, Identity, AnonymousIdentity

from . import user as user_blueprint
from .forms import LoginForm, RegistrationDetailForm, MobileRegistrationForm, EmailRegistrationForm, RegistrationForm
from app import db
from app.models import User, Collection, Item
from app.constants import *
from app.core import reset_password as model_reset_password
from app.permission import user_permission
from app.utils import md5_with_salt
from app.utils.redis import redis_set, redis_get


@user_blueprint.errorhandler(401)
def forbid(error):
    return redirect(url_for('user.login', next=request.url))


@user_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if request.method == 'POST':
        if form.validate():
            if form.login():
                return jsonify({'success': True})
        if 'csrf_token' in form.errors:
            return jsonify({'success': False, 'message': '登录失败, 请刷新页面重试'})
        return jsonify({'success': False, 'message': '用户名或密码错误'})
    return render_template('user/login.html', form=form)


@user_blueprint.route('/logout')
def logout():
    logout_user()
    identity_changed.send(current_app._get_current_object(), identity=AnonymousIdentity)
    return redirect(url_for('user.login'))


@user_blueprint.route('/register', methods=['GET', 'POST'])
def register():
    if USER_REGISTER_STEP_DONE in session and session[USER_REGISTER_STEP_DONE] == 1:
        return redirect(url_for('user.register_next'))
    if request.method == 'POST':
        form = MobileRegistrationForm()
        if form.validate():
            session[USER_REGISTER_MOBILE] = form.mobile.data
            session[USER_REGISTER_STEP_DONE] = 1
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': form.error2str()})
    return render_template('user/register.html', form=RegistrationForm())


@user_blueprint.route('/register_next', methods=['GET', 'POST'])
def register_next():
    if USER_REGISTER_STEP_DONE not in session or \
                            USER_REGISTER_MOBILE not in session and USER_REGISTER_EMAIL not in session:
        return redirect(url_for('user.register'))
    if request.method == 'POST':
        form = RegistrationDetailForm()
        if form.validate():
            form.register()
            session.pop(USER_REGISTER_STEP_DONE)
            session[USER_REGISTER_RESULT] = 1
            return jsonify({'success': True})
        return jsonify({'success': False, 'message': form.error2str()})
    return render_template('user/register_next.html', form=RegistrationDetailForm())


@user_blueprint.route('/register_result')
def register_result():
    if USER_REGISTER_RESULT in session:
        session.pop(USER_REGISTER_RESULT)
        return render_template('user/register_result.html', user=current_user)
    else:
        return redirect(url_for('main.index'))


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
            identity_changed.send(current_app._get_current_object(), identity=Identity(user.get_id()))
            return u'已激活'
        elif action == RESET_PASSWORD_ACTION:
            session['reset'] = True
            session['email'] = user_info['email']
            return redirect(url_for('reset_password'))
    return u'激活链接已失效'


@user_blueprint.route('/reset_password', methods=['GET', 'POST'])
def reset_password():
    return model_reset_password(User, 'user')


@user_blueprint.route('/profile')
@user_permission.require(401)
def profile():
    return render_template('user/profile.html', user=current_user)


@user_blueprint.route('/collection', methods=['GET', 'POST', 'DELETE'])
@user_permission.require(401)
def collection():
    if request.method == 'GET':
        page = request.args.get('page', 1, type=int)
        per_page = 18
        query = Collection.query.filter_by(user_id=current_user.id)
        amount = query.count()
        collections = query.paginate(page, per_page, False).items
        collection_dict = {'collections': [], 'amout': amount, 'page': page, 'pages': ceil(amount / per_page)}
        for collection in collections:
            image = collection.item.images.first()
            image_url = image.url if image else ''
            collection_dict['collections'].append({
                'item': collection.item.item,
                'price': collection.item.price,
                'deleted': collection.item.is_deleted,
                'item_id': collection.item.id,
                'image_url': image_url
            })
        return jsonify(collection_dict)

    item_id = request.form.get('item', 0, type=int)
    item = Item.query.get(item_id)
    item_collection = Collection.query.filter_by(user_id=current_user.id, item_id=item_id).first()
    if request.method == 'POST':
        if not item or item.is_deleted or item.is_component:
            return jsonify({'success': False, 'message': '该商品不存在'})
        elif not item_collection:
            item_collection = Collection(current_user.id, item_id)
            db.session.add(item_collection)
            db.session.commit()
        return jsonify({'success': True})
    else:  # DELETE
        if item_collection:
            db.session.delete(item_collection)
            db.session.commit()
        return jsonify({'success': True})


@user_blueprint.route('/address', methods=['GET'])
def address():
    return render_template('user/address.html')
