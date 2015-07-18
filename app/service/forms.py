# -*- coding: utf-8 -*-
from wtforms import StringField

from app.constants import SMS_CAPTCHA
from app.forms import Form
from app.utils.myj_captcha import send_sms_captcha
from app.utils.validator import Mobile, Captcha


class MobileRegisterSMSForm(Form):
    mobile = StringField(validators=[Mobile()])
    # captcha = StringField(validators=[Captcha(SMS_CAPTCHA, 'mobile')])

    def __init__(self, template, **kwargs):
        self.template = template
        super(Form, self).__init__(**kwargs)

    def send_sms(self):
        send_sms_captcha(self.template, self.mobile.data)
