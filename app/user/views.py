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
            if form.login():
                return jsonify({'success': True})
        if 'csrf_token' in form.errors:
            return jsonify({'success': False, 'message': '登录失败, 请刷新页面重试'})
        return jsonify({'success': False, 'message': '用户名或密码错误'})
    return render_template('user/login.html', user=current_user, form=form)


@user_blueprint.route('/logout')
def logout():
    logout_user()
    identity_changed.send(current_app._get_current_object(), identity=AnonymousIdentity())
    return redirect(url_for('main.index'))


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
        session.pop(USER_REGISTER_STEP_DONE)
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
        per_page = 18
        query = Collection.query.filter_by(user_id=current_user.id)
        amount = query.count()
        collections = query.paginate(page, per_page, False).items
        collection_dict = {'collections': [], 'amout': amount, 'page': page, 'pages': ceil(amount / per_page)}
        for collection in collections:
            image = collection.item.images.first()
            image_url = image.url if image else url_for('static', filename='img/user/item_default_img.jpg')
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
