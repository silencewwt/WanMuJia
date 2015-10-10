# -*- coding: utf-8 -*-
from flask import current_app, session
from flask.ext.login import login_user
from flask.ext.principal import identity_changed, Identity
from wtforms import StringField, PasswordField
from wtforms.validators import DataRequired, Length, EqualTo

from app import db
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
    mobile = StringField(validators=[Mobile()])
    captcha = StringField(validators=[Captcha(SMS_CAPTCHA, 'mobile')])


class EmailRegistrationForm(RegistrationForm):
    def __init__(self, *args, **kwargs):
        self.email.validators = [Email()]
        super(EmailRegistrationForm, self).__init__(*args, **kwargs)

    def validate_form(self, field):
        if field.data != USER_REGISTER_EMAIL:
            raise ValidationError()


class RegistrationDetailForm(Form):
    password = PasswordField(validators=[Length(6, 32, '请填写密码'), EqualTo('confirm_password', u'前后密码不一致哦!')])
    confirm_password = PasswordField(validators=[Length(6, 32, '请填写确认密码')])
    nickname = StringField(validators=[NickName()])
    mobile = StringField()
    email = StringField()

    def __init__(self, *args, **kwargs):
        super(RegistrationDetailForm, self).__init__(*args, **kwargs)
        if USER_REGISTER_MOBILE in session:
            self.mobile.data = session[USER_REGISTER_MOBILE]
        else:
            self.mobile.data = ''
        if USER_REGISTER_EMAIL in session:
            self.email.data = session[USER_REGISTER_EMAIL]
        else:
            self.email.data = ''

    def validate_mobile(self, field):
        if not field.data and not self.email.data:
            session.pop(USER_REGISTER_STEP_DONE)
            raise ValidationError('参数错误, 注册失败!')

    def register(self):
        user = User(
            password=self.password.data,
            mobile=self.mobile.data,
            email=self.email.data,
            nickname=self.nickname.data
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)
        identity_changed.send(current_app._get_current_object(), identity=Identity(user.get_id()))
        return user
