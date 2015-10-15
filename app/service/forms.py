# -*- coding: utf-8 -*-
from flask import current_app, url_for, request
from flask.ext.login import current_user
from wtforms import StringField, IntegerField

from app.constants import SMS_CAPTCHA, CONFIRM_EMAIL
from app.models import User, Vendor
from app.forms import Form
from app.wmj_email import send_email, USER_EMAIL_CONFIRM, VENDOR_EMAIL_CONFIRM, EMAIL_CONFIRM_SUBJECT, USER_REGISTER
from app.utils import md5_with_time_salt
from app.utils.myj_captcha import send_sms_captcha
from app.utils.redis import redis_set
from app.utils.validator import Mobile, Captcha, ValidationError, Email


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
    email = StringField(validators=[Email(required=False, available=False)])

    email_confirmed = False

    def __init__(self, email_type, *args, **kwargs):
        self.email_type = email_type
        super(EmailForm, self).__init__(*args, **kwargs)
        if current_user.is_authenticated:
            self.id.data = current_user.id
            if current_user.id_prefix == 'v':
                self.role.data = 'vendor'
            elif current_user.id_prefix == 'u':
                self.role.data = 'user'

    def validate_id(self, field):
        role = None
        if field.data is None:
            raise ValidationError(u'没有此用户')
        if self.role.data == 'user':
            role = User.query.get(field.data)
        elif self.role.data == 'vendor':
            role = Vendor.query.get(field.data)
        if not role:
            raise ValidationError(u'没有此用户')
        if not self.email.data:
            self.email.data = role.email
        self.email_confirmed = role.email_confirmed

    def send_email(self):
        if (self.email_type == VENDOR_EMAIL_CONFIRM or self.email_type == USER_EMAIL_CONFIRM) \
                and not self.email_confirmed:
            token = md5_with_time_salt(self.role.data, self.id.data)
            redis_set(CONFIRM_EMAIL, token, '', role=self.role.data, id=self.id.data, email=self.email.data, action='confirm')
            url = url_for('service.verify', token=token, _external=True)
            send_email(self.email, EMAIL_CONFIRM_SUBJECT, self.email_type, url=url)


class EmailRegisterForm(Form):
    email = StringField(validators=[Email()])

    def __init__(self, email_type, *args, **kwargs):
        self.email_type = email_type
        super(EmailRegisterForm, self).__init__(*args, **kwargs)

    def send_email(self):
        if self.email_type == USER_REGISTER:
            token = md5_with_time_salt(self.email.data)
            redis_set(CONFIRM_EMAIL, token, '', email=self.email.data, action='register')
            url = url_for('service.verify', token=token, _external=True)
            send_email(self.email.data, EMAIL_CONFIRM_SUBJECT, self.email_type, url=url)
