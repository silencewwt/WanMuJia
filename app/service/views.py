# -*- coding: utf-8 -*-
from flask import request, Response

from app.sms import USER_REGISTER_TEMPLATE, VENDOR_REGISTER_TEMPLATE
from app.utils.myj_captcha import get_image_captcha
from . import service as service_blueprint
from .forms import MobileRegisterSMSForm


@service_blueprint.route('/mobile_register_sms', methods=['POST'])
def mobile_register_sms():
    # TODO: image captcha
    referrer = request.referrer
    if referrer and 'vendor' in referrer.split('/'):
        template = VENDOR_REGISTER_TEMPLATE
    else:
        template = USER_REGISTER_TEMPLATE
    form = MobileRegisterSMSForm(template, csrf_enabled=False)
    print(form.mobile.data)
    if form.validate():
        form.send_sms()
        return 'ok', 200
    return 'false', 401


@service_blueprint.route('/captcha/<string:token>.jpg')
def serve_captcha(token):
    captcha = get_image_captcha(token)
    return Response(captcha, mimetype='image/jpeg')
