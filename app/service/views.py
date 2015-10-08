# -*- coding: utf-8 -*-
from flask import request, Response, jsonify, redirect, url_for, session

from app.constants import CONFIRM_EMAIL, USER_REGISTER_STEP_DONE, USER_REGISTER_EMAIL
from app.models import User, Vendor, Area
from app.sms import USER_REGISTER_TEMPLATE, VENDOR_REGISTER_TEMPLATE
from app.wmj_email import VENDOR_EMAIL_CONFIRM, USER_EMAIL_CONFIRM, USER_REGISTER
from app.utils.redis import redis_get
from app.utils.myj_captcha import get_image_captcha
from . import service as service_blueprint
from .forms import MobileRegisterSMSForm, EmailForm, EmailRegisterForm


@service_blueprint.route('/mobile_register_sms', methods=['POST'])
def mobile_register_sms():
    # TODO: image captcha
    referrer = request.referrer
    if referrer and 'vendor' in referrer.split('/'):
        template = VENDOR_REGISTER_TEMPLATE
    else:
        template = USER_REGISTER_TEMPLATE
    form = MobileRegisterSMSForm(template, csrf_enabled=False)
    if form.validate():
        form.send_sms()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': form.error2str()})


@service_blueprint.route('/send_email', methods=['POST'])
def email_service():
    email_type = request.args.get('type', '', type=str)
    if email_type in (VENDOR_EMAIL_CONFIRM, USER_EMAIL_CONFIRM):
        form = EmailForm(email_type)
    elif email_type in (USER_REGISTER, ):
        form = EmailRegisterForm(email_type)
    else:
        return jsonify({'success': False, 'message': u'参数错误!'})
    if form.validate():
        form.send_email()
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': form.error2str()})


@service_blueprint.route('/verify')
def verify():
    models = {'user': User, 'vendor': Vendor}
    token = request.args.get('token', '', type=str)
    info = redis_get(CONFIRM_EMAIL, token, delete=True)
    if info:
        if info['action'] == 'register':
            session[USER_REGISTER_STEP_DONE] = 1
            session[USER_REGISTER_EMAIL] = info['email']
            return redirect(url_for('user.register'))
        elif info['action'] == 'confirm':
            role = models[info['role']].query.get(info['id'])
            if role:
                role.email_confirmed = True
                return redirect(url_for('%s.settings' % info['role']))
    return u'此链接已失效'


@service_blueprint.route('/captcha/<string:token>.jpg')
def serve_captcha(token):
    captcha = get_image_captcha(token)
    return Response(captcha, mimetype='image/jpeg')


@service_blueprint.route('/cities')
def city_list():
    cities = Area.query.filter(Area.distributor_amount > 0, Area.level == 2)
    city_dict = {}
    for city in cities:
        if city.pinyin_index not in city_dict:
            city_dict[city.pinyin_index] = {}
        city_dict[city.pinyin_index][city.pinyin] = {'city': city.area, 'dist_amount': city.distributor_amount}
    return jsonify(city_dict)
