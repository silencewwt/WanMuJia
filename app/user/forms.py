# -*- coding: utf-8 -*-
from flask import current_app, session
from flask.ext.cdn import url_for
from flask.ext.login import login_user, current_user, logout_user
from flask.ext.principal import identity_changed, Identity, AnonymousIdentity
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Length, EqualTo

from app import db
from app.constants import *
from app.models import User
from app.utils import md5_with_time_salt
from app.utils.forms import Form
from app.utils.redis import redis_set
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

    def validate_mobile(self, field):
        if not User.query.filter_by(mobile=field.data).first():
            raise ValidationError('该手机号码未注册用户!')


class ResetPasswordDetailForm(Form):
    password = PasswordField(validators=[Length(6, 32, '请填写密码'), EqualTo('confirm_password', u'前后密码不一致哦!')])
    confirm_password = PasswordField(validators=[Length(6, 32, '请填写确认密码')])
    mobile = StringField()

    def __init__(self, *args, **kwargs):
        super(ResetPasswordDetailForm, self).__init__(*args, **kwargs)
        if USER_RESET_PASSWORD_MOBILE not in session:
            raise ValidationError('参数错误, 注册失败')
        self.mobile.data = session[USER_RESET_PASSWORD_MOBILE]

    def update_password(self):
        user = User.query.filter_by(mobile=self.mobile.data).first()
        if user:
            user.password = self.password.data
            db.session.commit()
        return user


class SettingForm(Form):
    nothing = StringField()
    username = StringField()
    captcha = StringField()
    password = StringField()
    old_password = StringField()
    confirm_password = StringField()
    email = StringField()

    def __init__(self, type, *args, **kwargs):
        super(SettingForm, self).__init__(*args, **kwargs)
        self.type = type
        if self.type == USER_USERNAME_SETTING:
            self.username.validators = [UserName(required=False, exist_owner=current_user)]
            self.captcha.validators = [Captcha(SMS_CAPTCHA, current_user.mobile, required=False)]
        elif self.type == USER_PASSWORD_SETTING:
            self.old_password.validators = [Length(32, 32)]
            self.password.validators = [Length(32, 32)]
            self.confirm_password.validators = [Length(32, 32), EqualTo('new_password', '两次密码不一致')]
        else:  # email
            self.email.validators = [Email()]
            self.captcha.validators = [Captcha(SMS_CAPTCHA, current_user.mobile, required=False)]

    def validate_nothing(self, field):
        if self.type == USER_PASSWORD_SETTING:
            if not current_user.verify_password(self.old_password.data):
                raise ValidationError('原密码错误!')

    def update(self):
        if self.type == USER_USERNAME_SETTING:
            if self.username.data != current_user.username and current_user.username_revisable:
                current_user.username = self.username.data
                current_user.username_revisable = False
        elif self.type == USER_PASSWORD_SETTING:
            current_user.password = self.password.data
            db.session.commit()
            logout_user()
            identity_changed.send(current_app._get_current_object(), identity=AnonymousIdentity())
            return
        else:  # email
            current_user.email = self.email.data
            current_user.email_confirmed = False
            token = md5_with_time_salt(self.email.data)
            redis_set(CONFIRM_EMAIL, token, {'email': self.email.data, 'action': 'confirm'}, serialize=True)
            url = url_for('service.verify', token=token, _external=True)
            send_email(self.email.data, EMAIL_CONFIRM_SUBJECT, USER_EMAIL_CONFIRM, url=url)
        db.session.commit()
