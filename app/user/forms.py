# -*- coding: utf-8 -*-
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Length, EqualTo

from app.constants import *
from app.utils.forms import Form
from app.utils.validator import Email, Mobile, Captcha, UserName


class LoginForm(Form):
    username = StringField(validators=[DataRequired(), Length(2, 14)])
    password = PasswordField('Password', validators=[DataRequired()])


class RegistrationForm(Form):
    mobile = StringField(validators=[Mobile(), Length(11, 11)])
    password = PasswordField(validators=[DataRequired(), Length(6, 32), EqualTo('confirm_password', u'前后密码不一致哦!')])
    confirm_password = PasswordField(validators=[DataRequired(), Length(6, 32)])
    email = StringField(validators=[Email(required=False)])
    captcha = StringField(validators=[Captcha(IMAGE_CAPTCHA, 'mobile')])


class MobileRegistrationForm(Form):
    mobile = StringField(validators=[Mobile(), Length(11, 11)])
    captcha = StringField(validators=[Captcha(SMS_CAPTCHA, 'mobile')])


class EmailRegistrationForm(Form):
    email = StringField(validators=[Email()])


class RegistrationDetailForm(Form):
    password = PasswordField(validators=[DataRequired(), Length(6, 32), EqualTo('confirm_password', u'前后密码不一致哦!')])
    confirm_password = PasswordField(validators=[DataRequired(), Length(6, 32)])
    username = StringField(validators=[UserName()])
