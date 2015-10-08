# -*- coding: utf-8 -*-
import re
from base64 import b64decode
from flask import session
from wtforms.validators import Regexp, Email as BaseEmail, ValidationError
from PIL import Image as BaseImage

from app.models import User, Vendor, Distributor, Privilege, Area
from app.constants import IMAGE_CAPTCHA_CODE
from app.utils import IO
from app.utils.redis import redis_verify


class Email(BaseEmail):
    def __init__(self, required=True, available=True, model=None, exist_owner=None, message=u'邮箱不符合规范!'):
        self.required = required
        self.available = available
        self.model = model
        self.exist_owner = exist_owner
        super(Email, self).__init__(message)

    def __call__(self, form, field):
        if self.required or field.data:
            super(Email, self).__call__(form, field)
            if self.available and not available_email(field.data, self.model, self.exist_owner):
                raise ValidationError(u'邮箱已被绑定')


class Mobile(Regexp):
    def __init__(self, available=True, message=u'手机号码不正确'):
        self.available = available
        self.message = message
        super(Mobile, self).__init__(r'^1[3-8]\d{9}$', message=self.message)

    def __call__(self, form, field, message=None):
        super(Mobile, self).__call__(form, field, self.message)
        if self.available and not available_mobile(field.data):
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


class AreaValidator(object):
    def __init__(self, message=u'地址信息有误'):
        self.message = message

    def __call__(self, form, field):
        area = Area.query.filter_by(cn_id=field.data).limit(1).first()
        if not area or Area.query.filter_by(father_id=area.id).count() > 0:
            raise ValidationError(self.message)


class QueryID(object):
    def __init__(self, model, required=True, message=u'参数错误'):
        self.model = model
        self.required = required
        self.message = message

    def __call__(self, form, field):
        if self.required or field.data:
            if not isinstance(field.data, (list, tuple)):
                if field.data is None or not self.model.query.get(field.data):
                    raise ValidationError(self.message)
            else:
                if not field.data:
                    raise ValidationError(self.message)
                for data in field.data:
                    if field.data is None or not self.model.query.get(data):
                        raise ValidationError(self.message)


class NickName(object):
    def __call__(self, form, field):
        if not re.match(r'^\w{4,30}$', field.data, re.UNICODE) or re.match(r'^\d*$', field.data, re.UNICODE):
            raise ValidationError(u'用户名不正确')


class Image(object):
    def __init__(self, required=True, base64=False, message=u'图片不正确'):
        self.required = required
        self.base64 = base64
        self.message = message

    def __call__(self, form, field):
        if self.required or field.data:
            if not field.data:
                raise ValidationError(self.message)
            if self.base64:
                image_str = IO(b64decode(field.data[23:]))
            else:
                image_str = field.data.stream
            try:
                BaseImage.open(image_str)
            except OSError:
                raise ValidationError(self.message)


class Digit(object):
    def __init__(self, required=True, min=None, max=None, default=None, type=float, message='数字不正确!'):
        self.required = required
        self.min = min
        self.max = max
        self.type = type
        self.message = message
        self.default = default

    def __call__(self, form, field):
        data = field.data
        if self.required or data:
            if isinstance(data, str):
                try:
                    data = self.type(data)
                except:
                    raise ValidationError(self.message)
            if not isinstance(data, (int, float)) or (self.min is not None and data < self.min) or\
                    (self.max is not None and data > self.max):
                raise ValidationError(self.message)
        if self.default is not None and data is None:
            field.data = self.default


def available_mobile(mobile):
    if User.query.filter_by(mobile=mobile).first() or \
            Vendor.query.filter_by(mobile=mobile).first():
        return False
    return True


def available_email(email, model, exist_owner):
    if model is None:
        if User.query.filter_by(email=email).first() or Vendor.query.filter_by(email=email).first():
            return False
    else:
        role = model.query.filter_by(email=email)
        if role.count() > 1 or not role.first() or role.first().id != exist_owner.id:
            return False
    return True


def validate_mobile(mobile):
    match = re.match(r'^1[3-8]\d{9}$', mobile)
    if not match:
        return False
    return True
