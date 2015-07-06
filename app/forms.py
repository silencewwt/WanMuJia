# -*- coding: utf-8 -*-
from flask.ext.wtf import Form
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Length, EqualTo

from app.constants import *
from app.utils.validator import Email, Mobile, Captcha


class ResetPasswordForm(Form):
    password = PasswordField(validators=[DataRequired(), Length(6, 32), EqualTo('confirm_password', u'前后密码不一致哦!')])
    confirm_password = PasswordField(validators=[DataRequired(), Length(6, 32)])


class MobileResetPasswordForm(Form):
    mobile = StringField(validators=[Mobile()])
    captcha = StringField(validators=[Captcha(SMS_CAPTCHA, 'mobile')])


class EmailResetPasswordForm(Form):
    email = StringField(validators=[Email()])
    captcha = StringField(validators=[Captcha(IMAGE_CAPTCHA, 'email')])


class MobileRegistrationForm(Form):
    mobile = StringField(validators=[Mobile(), Length(11, 11)])
    captcha = StringField(validators=[Captcha(SMS_CAPTCHA, 'mobile')])
