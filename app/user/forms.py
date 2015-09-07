# -*- coding: utf-8 -*-
from flask import current_app
from flask.ext.login import login_user
from flask.ext.principal import identity_changed, Identity
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Length, EqualTo

from app.constants import *
from app.models import User
from app.utils.forms import Form
from app.utils.validator import Email, Mobile, Captcha, NickName, ValidationError


class LoginForm(Form):
    username = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired()])

    def login(self):
        user = User.query.filter_by(mobile=self.username.data).first() or \
            User.query.filter_by(email=self.username.data).first()
        if user and user.verify_password(self.password.data):
            login_user(user)
            identity_changed.send(current_app._get_current_object(), identity=Identity(user.get_id()))
            return True
        return False


class RegistrationForm(Form):
    mobile = StringField()
    email = StringField()
    captcha = StringField()
    form = StringField()


class MobileRegistrationForm(RegistrationForm):
    def __init__(self, *args, **kwargs):
        self.mobile.validators = [Mobile(), Length(11, 11)]
        self.captcha.validators = [Captcha(SMS_CAPTCHA, 'mobile')]
        super(MobileRegistrationForm, self).__init__(*args, **kwargs)

    def validate_form(self, field):
        if field.data != USER_REGISTER_MOBILE:
            raise ValidationError()


class EmailRegistrationForm(RegistrationForm):
    def __init__(self, *args, **kwargs):
        self.email.validators = [Email()]
        super(EmailRegistrationForm, self).__init__(*args, **kwargs)

    def validate_form(self, field):
        if field.data != USER_REGISTER_EMAIL:
            raise ValidationError()


class RegistrationDetailForm(Form):
    password = PasswordField(validators=[DataRequired(), Length(6, 32), EqualTo('confirm_password', u'前后密码不一致哦!')])
    confirm_password = PasswordField(validators=[DataRequired(), Length(6, 32)])
    nickname = StringField(validators=[NickName()])
