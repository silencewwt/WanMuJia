# -*- coding: utf-8 -*-
from flask import url_for
from flask.ext.login import current_user
from wtforms import StringField, IntegerField

from app.constants import CONFIRM_EMAIL, IMAGE_CAPTCHA, USER_GUIDE, VENDOR_REGISTER, USER_REGISTER, \
    USER_RESET_PASSWORD, VENDOR_EMAIL_CONFIRM, USER_EMAIL_CONFIRM, USER_SMS_CAPTCHA
from app.models import User, Vendor, Distributor
from app.forms import Form
from app.sms import sms_generator
from app.wmj_email import send_email, EMAIL_CONFIRM_SUBJECT, USER_EMAIL_CONFIRM
from app.utils import md5_with_time_salt
from app.utils.redis import redis_set
from app.utils.validator import Mobile, Captcha, ValidationError, Email, QueryID
from app.utils.myj_captcha import send_sms_captcha


class MobileSMSForm(Form):
    nothing = StringField()
    mobile = StringField()
    captcha = StringField()
    distributor_id = IntegerField()

    def __init__(self, sms_type, template, *args, **kwargs):
        self.template = template
        self.sms_type = sms_type
        if self.sms_type == USER_RESET_PASSWORD or self.sms_type == USER_SMS_CAPTCHA:
            self.mobile.validators = [Mobile(available=False)]
        elif self.sms_type == USER_GUIDE:
            self.mobile.validators = [Mobile(available=False)]
            self.distributor_id.validators = [QueryID(Distributor)]
            self.captcha.validators = [Captcha(IMAGE_CAPTCHA, '')]
        elif self.sms_type == USER_REGISTER:
            self.mobile.validators = [Mobile(model=User)]
        elif self.sms_type == VENDOR_REGISTER:
            self.mobile.validators = [Mobile(model=Vendor)]
        super(Form, self).__init__(*args, **kwargs)

    def validate_nothing(self, field):
        if self.sms_type == USER_RESET_PASSWORD:
            if not User.query.filter_by(mobile=self.mobile.data).first():
                raise ValidationError('该手机号码未注册用户!')

    def send_sms(self):
        if self.sms_type == USER_RESET_PASSWORD or self.sms_type == USER_REGISTER or self.sms_type == VENDOR_REGISTER \
                or self.sms_type == USER_SMS_CAPTCHA:
            send_sms_captcha(self.template, self.mobile.data)
        elif self.sms_type == USER_GUIDE:
            distributor = Distributor.query.get(self.distributor_id.data)
            sms_generator(self.template, self.mobile.data,
                          distributor.address.precise_address(), distributor.ext_number)


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
        if role.email and role.email_confirmed:
            raise ValidationError('邮箱已绑定, 暂时无法修改')
        if not self.email.data:
            self.email.data = role.email
        self.email_confirmed = role.email_confirmed

    def send_email(self):
        if (self.email_type == VENDOR_EMAIL_CONFIRM or self.email_type == USER_EMAIL_CONFIRM) \
                and not self.email_confirmed:
            token = md5_with_time_salt(self.role.data, self.id.data)
            redis_set(CONFIRM_EMAIL, token, {'role': self.role.data, 'id': self.id.data,
                                             'email': self.email.data, 'action': 'confirm'}, serialize=True)
            url = url_for('service.verify', token=token, _external=True)
            send_email(self.email.data, EMAIL_CONFIRM_SUBJECT, self.email_type, url=url)


class EmailRegisterForm(Form):
    email = StringField(validators=[Email()])

    def __init__(self, email_type, *args, **kwargs):
        self.email_type = email_type
        super(EmailRegisterForm, self).__init__(*args, **kwargs)

    def send_email(self):
        if self.email_type == USER_REGISTER:
            token = md5_with_time_salt(self.email.data)
            redis_set(CONFIRM_EMAIL, token, {'email': self.email.data, 'action': 'register'}, serialize=True)
            url = url_for('service.verify', token=token, _external=True)
            send_email(self.email.data, EMAIL_CONFIRM_SUBJECT, self.email_type, url=url)


class EmailResetPasswordForm(Form):
    email = StringField(validators=[Email(available=False)])

    def __init__(self, email_type, *args, **kwargs):
        self.email_type = email_type
        super(EmailResetPasswordForm, self).__init__(*args, **kwargs)

    def send_email(self):
        if self.email_type == USER_RESET_PASSWORD:
            token = md5_with_time_salt(self.email.data)
            redis_set(CONFIRM_EMAIL, token, {'email': self.email.data, 'action': 'reset_password'}, serialize=True)
            url = url_for('service.verify', token=token, _external=True)
            send_email(self.email.data, EMAIL_CONFIRM_SUBJECT, self.email_type, url=url)
