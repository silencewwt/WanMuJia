# -*- coding: utf-8 -*-
from flask import current_app, session
from flask.ext.login import login_user, current_user
from flask.ext.principal import identity_changed, Identity
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Length, EqualTo

from app import db
from app.constants import *
from app.models import User
from app.utils.forms import Form
from app.utils.validator import Email, Mobile, Captcha, UserName, ValidationError
from app.wmj_email import send_email, USER_EMAIL_CONFIRM, EMAIL_CONFIRM_SUBJECT


class LoginForm(Form):
    username = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired()])
    remember = BooleanField()

    def login(self):
        user = User.query.filter_by(mobile=self.username.data).first() or \
            User.query.filter_by(email=self.username.data).first()
        if user and user.verify_password(self.password.data):
            login_user(user, remember=self.remember.data)
            identity_changed.send(current_app._get_current_object(), identity=Identity(user.get_id()))
            return user
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
    mobile = StringField()

    def __init__(self, *args, **kwargs):
        super(RegistrationDetailForm, self).__init__(*args, **kwargs)
        if USER_REGISTER_MOBILE not in session:
            raise ValidationError('参数错误, 注册失败')
        self.mobile.data = session[USER_REGISTER_MOBILE]

    def register(self):
        user = User(
            password=self.password.data,
            mobile=self.mobile.data,
            email='',
        )
        db.session.add(user)
        db.session.commit()
        login_user(user)
        identity_changed.send(current_app._get_current_object(), identity=Identity(user.get_id()))
        return user


class ResetPasswordForm(Form):
    mobile = StringField(validators=[Mobile(available=False)])
    captcha = StringField(validators=[Captcha(SMS_CAPTCHA, 'mobile')])


class ResetPasswordNextForm(Form):
    password = PasswordField(validators=[Length(32, 32)])
    confirm_password = PasswordField(validators=[Length(32, 32), EqualTo('password', '前后密码不一致')])

    def reset_password(self):
        user = User.query.filter_by(mobile=session[USER_RESET_PASSWORD_USERNAME]).first() or\
            User.query.filter_by(email=session[USER_RESET_PASSWORD_USERNAME]).first()
        if user is not None:
            user.password = self.password.data
            db.session.commit()
            return True
        return False


class SettingForm(Form):

    def __init__(self, type, *args, **kwargs):
        self.type = type
        if self.type == USER_USERNAME_SETTING:
            self.username = StringField(validators=[UserName(required=False, exist_owner=current_user)])
        elif self.type == USER_PASSWORD_SETTING:
            self.password = StringField(validators=[Length(32, 32)])
            self.confirm_password = PasswordField(validators=[Length(32, 32), EqualTo('new_password', '两次密码不一致')])
        else:  # email
            self.email = StringField(validators=Email())
        self.captcha = StringField(validators=[Captcha(SMS_CAPTCHA, current_user.mobile, required=False)])
        super(SettingForm, self).__init__(*args, **kwargs)

    def update(self):
        if self.type == USER_USERNAME_SETTING:
            if self.username.data != current_user.username and current_user.username_revisable:
                current_user.username = self.username.data
                current_user.username_revisable = False
        elif self.type == USER_PASSWORD_SETTING:
            current_user.password = self.password.data
        else:  # email
            current_user.email = self.email.data
            current_user.email_confirmed = False
            send_email(self.email.data, EMAIL_CONFIRM_SUBJECT, USER_EMAIL_CONFIRM)
        db.session.commit()
