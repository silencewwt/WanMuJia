# -*- coding: utf-8 -*-
from math import ceil
from flask import current_app, request, render_template, redirect, session, jsonify
from flask.ext.cdn import url_for
from flask.ext.login import logout_user, current_user
from flask.ext.principal import identity_changed, AnonymousIdentity

from app import db
from app.models import Collection, Item
from app.constants import *
from app.permission import user_permission
from app.utils import items_json
from . import user as user_blueprint
from .forms import LoginForm, RegistrationDetailForm, MobileRegistrationForm, RegistrationForm, \
    SettingForm, PasswordForm, ResetPasswordForm, ResetPasswordNextForm


@user_blueprint.errorhandler(401)
def forbid(error):
    return redirect(url_for('user.login', next=request.url))


@user_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if request.method == 'POST':
        if form.validate():
            user = form.login()
            if user is not False:
                return jsonify({'success': True, 'user': {'username': user.username,
                                                          'mobile': user.mobile, 'email': user.email,
                                                          'username_revisable': user.username_revisable}})
        if 'csrf_token' in form.errors:
            return jsonify({'success': False, 'message': '登录失败, 请刷新页面重试'})
        return jsonify({'success': False, 'message': '用户名或密码错误'})
    return render_template('user/login.html')


@user_blueprint.route('/logout')
def logout():
    logout_user()
    identity_changed.send(current_app._get_current_object(), identity=AnonymousIdentity())
    return redirect(url_for('main.index'))


@user_blueprint.route('/register', methods=['GET', 'POST'])
def register():
    step = request.args.get('step', 1, type=int)
    if USER_REGISTER_STEP not in session:
        if step not in (1, 2):
            return redirect(url_for('main.index'))
        session[USER_REGISTER_STEP] = 1
    elif session[USER_REGISTER_STEP] != step:
        return redirect(url_for('user.register', step=session[USER_REGISTER_STEP]))

    if request.method == 'GET':
        MobileRegistrationForm()  # generate csrf_token in cookie
        return render_template('user/signed_up.html')

    if step == 1:
        form = MobileRegistrationForm()
        if form.validate():
            session[USER_REGISTER_MOBILE] = form.mobile.data
            session[USER_REGISTER_STEP] = 2
            return jsonify({'success': True})
        else:
            return jsonify({'success': False, 'message': form.error2str()})
    elif step == 2:
        if USER_REGISTER_MOBILE not in session:
            session[USER_REGISTER_STEP] = 1
            return redirect(url_for('user.register', step=1))
        form = RegistrationDetailForm()
        if form.validate():
            user = form.register()
            session.pop(USER_REGISTER_STEP)
            return jsonify({'success': True, 'user': {'username': user.username, 'mobile': user.mobile}})
        return jsonify({'success': False, 'message': form.error2str()})


@user_blueprint.route('/reset_password', methods=['GET', 'POST'])
def reset_password():
    if USER_RESET_PASSWORD_STEP_DONE in session:
        return redirect(url_for('user.reset_password_next'))
    form = ResetPasswordForm()
    if request.method == 'POST':
        if form.validate():
            session[USER_RESET_PASSWORD_STEP_DONE] = 1
            session[USER_RESET_PASSWORD_USERNAME] = form.mobile.data
            return jsonify({'success': True})
        return jsonify({'success': False, 'message': form.error2str()})
    return render_template('user/reset_password.html', form=form)


@user_blueprint.route('/reset_password_next', methods=['GET', 'POST'])
def reset_password_next():
    if USER_RESET_PASSWORD_STEP_DONE not in session:
        return redirect(url_for('user.reset_password'))
    if USER_RESET_PASSWORD_USERNAME not in session:
        session.pop(USER_RESET_PASSWORD_STEP_DONE)
        return redirect(url_for('user.reset_password'))
    form = ResetPasswordNextForm()
    if request.method == 'POST':
        if form.validate():
            form.reset_password()
            session.pop(USER_RESET_PASSWORD_STEP_DONE)
            session.pop(USER_RESET_PASSWORD_USERNAME)
            return jsonify({'success': True})
        return jsonify({'success': False, 'message': form.error2str()})
    return render_template('user/reset_password_next.html', form=form)


@user_blueprint.route('/profile')
@user_permission.require(401)
def profile():
    return render_template('user/profile.html', user=current_user, form=SettingForm())


@user_blueprint.route('/collection', methods=['GET', 'POST', 'DELETE'])
@user_permission.require(401)
def collection():
    if request.method == 'GET':
        page = request.args.get('page', 1, type=int)
        per_page = 10
        query = Collection.query.filter_by(user_id=current_user.id)
        amount = query.count()
        collections = query.paginate(page, per_page, False).items
        collection_dict = {'collections': items_json([collection.item for collection in collections]),
                           'amount': amount, 'page': page, 'pages': ceil(amount / per_page)}
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


@user_blueprint.route('/settings', methods=['POST'])
@user_permission.require(401)
def settings():
    form = SettingForm()
    if form.validate():
        form.update()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': form.error2str()})


@user_blueprint.route('/change_password', methods=['POST'])
@user_permission.require(401)
def change_password():
    form = PasswordForm()
    if form.validate():
        form.update_password()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': form.error2str()})


@user_blueprint.route('/address', methods=['GET'])
def address():
    return render_template('user/address.html', user=current_user)


@user_blueprint.route('/logined')
def logined():
    if current_user.is_authenticated and current_user.id_prefix == 'u':
        return jsonify({'logined': True, 'username': current_user.username,
                        'mobile': current_user.mobile, 'email': current_user.email,
                        'username_revisable': current_user.username_revisable})
    else:
        return jsonify({'logined': False})
