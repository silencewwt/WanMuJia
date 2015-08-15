# -*- coding: utf-8 -*-
from flask import current_app
from flask.ext.login import login_user
from flask.ext.principal import identity_changed, Identity
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Length, EqualTo

from app.constants import *
from app.models import User
from app.utils.forms import Form
from app.utils.validator import Email, Mobile, Captcha, UserName


class LoginForm(Form):
    username = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired()])

    def login(self):
        user = User.query.filter_by(mobile=self.username.data).first() or \
            User.query.filter_by(email=self.username.data).first() or \
            User.query.filter_by(username=self.username.data).first()
        if user and user.verify_password(self.password.data):
            login_user(user)
            identity_changed.send(current_app._get_current_object(), identity=Identity(user.get_id()))
            return True
        return False


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
