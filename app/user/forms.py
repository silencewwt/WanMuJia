# -*- coding: utf-8 -*-
from flask.ext.wtf import Form
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Length, EqualTo

from app.utils.validator import Email, Mobile


class LoginForm(Form):
    username = StringField(validators=[DataRequired(), Length(2, 14)])
    password = PasswordField('Password', validators=[DataRequired()])
    remember_me = BooleanField('Keep me logged in')


class RegistrationForm(Form):
    mobile = StringField(validators=[Mobile(u'手机号码不正确哦!'), Length(11, 11)])
    password = PasswordField(validators=[DataRequired(), Length(6, 32), EqualTo('confirm_password', u'前后密码不一致哦!')])
    confirm_password = PasswordField(validators=[DataRequired(), Length(6, 32)])
    email = StringField(validators=[Email(required=False, message=u'邮箱不符合规范')])


class EmailRegistrationForm(Form):
    email = StringField(validators=[Email(required=True, message=u'邮箱不符合规范')])
    password = PasswordField(validators=[DataRequired(), Length(6, 32), EqualTo('confirm_password', u'前后密码不一致哦!')])
    confirm_password = PasswordField(validators=[DataRequired(), Length(6, 32)])