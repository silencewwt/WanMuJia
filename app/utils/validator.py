# -*- coding: utf-8 -*-
import re
from flask import session
from wtforms.validators import Regexp, Email as BaseEmail, ValidationError
from PIL import Image as BaseImage

from app.models import User, Vendor, Distributor, Privilege, Province, City, District
from app.constants import IMAGE_CAPTCHA_CODE
from app.utils.redis import redis_verify


class Email(BaseEmail):
    def __init__(self, required=True, available=True, message=u'邮箱不符合规范!'):
        self.required = required
        self.available = available
        self.message = message
        super(Email, self).__init__(message)

    def __call__(self, form, field):
        if self.required or field.data:
            super(Email, self).__call__(form, field)
            if self.available and not available_email(field.data):
                raise ValidationError(self.message)


class Mobile(Regexp):
    def __init__(self, available=True, message=u'手机号码不符合规范!'):
        self.available = available
        self.message = message
        super(Mobile, self).__init__(r'^1[3-8]\d{9}$', message=self.message)

    def __call__(self, form, field, message=None):
        super(Mobile, self).__call__(form, field, self.message)
        if self.available:
            if not available_mobile(field.data):
                raise ValidationError(u'手机号已经被绑定')


class Captcha(object):
    def __init__(self, captcha_type, key_field, message=u'验证码错误'):
        self.captcha_type = captcha_type
        self.key_field = key_field
        self.message = message

    def __call__(self, form, field):
        if self.captcha_type == IMAGE_CAPTCHA_CODE:
            if 'captcha_token' not in session:
                raise ValidationError(self.message)
            if not redis_verify(self.captcha_type, session['captcha_token'], field.data.upper()):
                raise ValidationError(self.message)
        else:
            if not redis_verify(self.captcha_type, form[self.key_field].data, field.data):
                raise ValidationError(self.message)


class DistrictValidator(object):
    def __init__(self, message=u'地址信息有误'):
        self.message = message

    def __call__(self, form, field):
        if not District.query.filter_by(cn_id=field.data).limit(1).first() or \
                City.query.filter_by(cn_id=field.data).limit(1).first() or \
                Province.query.filter_by(cn_id=field.data).limit(1).first():
            raise ValidationError(self.message)


class QueryID(object):
    def __init__(self, model):
        self.model = model

    def __call__(self, form, field):
        if not self.model.query.get(field.data):
            raise ValidationError(u'参数错误!')


class UserName(object):
    def __call__(self, form, field):
        if not re.match(r'^\w{4,14}$', field.data, re.UNICODE) or re.match(r'^\d*$', field.data, re.UNICODE):
            raise ValidationError(u'用户名中含有非法字符!')
        if not available_username(field.data):
            raise ValidationError(u'该用户名已被使用!')


class Image(object):
    def __init__(self, required=True):
        self.required = required

    def __call__(self, form, field):
        if self.required or field.data:
            try:
                im = BaseImage.open(field.data.stream.raw)
                im.close()
                del im
            except:
                raise ValidationError(u'图片格式错误')


def available_mobile(mobile):
    if User.query.filter_by(mobile=mobile).first() or \
            Vendor.query.filter_by(mobile=mobile).first():
        return False
    return True


def available_email(email):
    if User.query.filter_by(email=email).first() or Vendor.query.filter_by(email=email).first():
        return False
    return True


def validate_mobile(mobile):
    match = re.match(r'^1[3-8]\d{9}$', mobile)
    if not match:
        return False
    return True


def available_username(username):
    return not User.query.filter_by(username=username).limit(1).first()
