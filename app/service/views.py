# -*- coding: utf-8 -*-
from flask import request, Response, jsonify, redirect, url_for

from app.constants import CONFIRM_EMAIL
from app.models import User, Vendor
from app.sms import USER_REGISTER_TEMPLATE, VENDOR_REGISTER_TEMPLATE
from app.utils.redis import redis_get
from app.utils.myj_captcha import get_image_captcha
from . import service as service_blueprint
from .forms import MobileRegisterSMSForm, EmailForm


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
    form = EmailForm()
    if form.validate():
        form.send_email(email_type)
        return jsonify({'success': True})
    return jsonify({'success': False, 'message': form.error2str()})


@service_blueprint.route('/verify')
def verify():
    models = {'user': User, 'vendor': Vendor}
    token = request.args.get('token', '', type=str)
    info = redis_get(CONFIRM_EMAIL, token, delete=True)
    if info:
        role = models[info['role']].query.get(info['id'])
        if role:
            role.email_confirmed = True
            return redirect(url_for('%s.settings' % info['role']))
    return u'此链接已失效'


@service_blueprint.route('/captcha/<string:token>.jpg')
def serve_captcha(token):
    captcha = get_image_captcha(token)
    return Response(captcha, mimetype='image/jpeg')
