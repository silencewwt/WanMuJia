# -*- coding: utf-8 -*-
from flask import request, Response

from app.utils.myj_captcha import get_image_captcha
from . import service as service_blueprint
from .forms import MobileRegisterSMSForm


@service_blueprint.route('/mobile_register_sms', methods=['POST'])
def mobile_register_sms():
    form = MobileRegisterSMSForm(csrf_enabled=False)
    if form.validate():
        form.send_sms()
        resp = Response('ok', 200)
        resp.set_cookie('csrf', '', expires=0)
        return resp
    return 'false', 401


@service_blueprint.route('/captcha/<string:token>.jpg')
def serve_captcha(token):
    captcha = get_image_captcha(token)
    return Response(captcha, mimetype='image/jpeg')
