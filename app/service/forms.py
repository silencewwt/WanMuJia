# -*- coding: utf-8 -*-
from flask import request
from wtforms import StringField, ValidationError

from app.constants import SMS_CAPTCHA
from app.forms import Form
from app.utils.myj_captcha import send_sms_captcha
from app.utils.validator import Mobile, Captcha


class MobileRegisterSMSForm(Form):
    mobile = StringField(validators=[Mobile()])
    csrf_token = StringField()
    captcha = StringField(validators=[Captcha(SMS_CAPTCHA, 'mobile')])

    def __init__(self, template):
        self.template = template
        super(Form, self).__init__()

    def validate_csrf_token(self, field):
        if 'csrf' not in request.cookies or request.cookies['csrf'] != field.data:
            raise ValidationError()

    def send_sms(self):
        send_sms_captcha(self.template, self.mobile.data)
