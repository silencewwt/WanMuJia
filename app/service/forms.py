# -*- coding: utf-8 -*-
from flask import current_app
from wtforms import StringField, IntegerField

from app.constants import SMS_CAPTCHA, CONFIRM_EMAIL
from app.models import User, Vendor
from app.forms import Form
from app.wmj_email import send_email, USER_EMAIL_CONFIRM, VENDOR_EMAIL_CONFIRM
from app.utils import md5_with_time_salt
from app.utils.myj_captcha import send_sms_captcha
from app.utils.redis import redis_set
from app.utils.validator import Mobile, Captcha, ValidationError


class MobileRegisterSMSForm(Form):
    mobile = StringField(validators=[Mobile()])
    # captcha = StringField(validators=[Captcha(SMS_CAPTCHA, 'mobile')])

    def __init__(self, template, **kwargs):
        self.template = template
        super(Form, self).__init__(**kwargs)

    def send_sms(self):
        send_sms_captcha(self.template, self.mobile.data)


class EmailForm(Form):
    role = StringField()
    id = IntegerField()

    email = None
    email_confirmed = False

    def validate_id(self, field):
        role = None
        if self.role.data == 'user':
            role = User.query.get(field.data)
        elif self.role.data == 'vendor':
            role = Vendor.query.get(field.data)
        if not role:
            raise ValidationError(u'没有此用户')
        self.email = role.email
        self.email_confirmed = role.email_confirmed

    def send_email(self, email_type):
        if (email_type == VENDOR_EMAIL_CONFIRM or email_type == USER_EMAIL_CONFIRM) and not self.email_confirmed:
            token = md5_with_time_salt(self.role.data, self.id.data)
            redis_set(CONFIRM_EMAIL, token, 86400)
            url = '%s/service/?token=%s' % (current_app.config['HOST'], token)
            send_email(self.email, '', email_type, url=url)

