# -*- coding: utf-8 -*-
from flask import request
from flask.ext.wtf import Form
from wtforms import StringField, ValidationError

from app.constants import SMS_CAPTCHA
from app.utils.myj_captcha import send_sms_captcha
from app.utils.validator import Mobile, Captcha


class MobileRegisterSMSForm(Form):
    mobile = StringField(validators=[Mobile()])
    csrf_token = StringField()
    captcha = StringField(validators=[Captcha(SMS_CAPTCHA, 'mobile')])

    def validate_csrf_token(self, field):
        if 'csrf' not in request.cookies or request.cookies['csrf'] != field.data:
            raise ValidationError()

    def send_sms(self):
        send_sms_captcha(self.mobile.data)
