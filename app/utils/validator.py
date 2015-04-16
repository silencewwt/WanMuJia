# -*-coding: utf-8 -*-
from wtforms.validators import Regexp, Email as BaseEmail, ValidationError

from app.models import User, Producer, Dealer, Privilege


class Email(BaseEmail):
    def __init__(self, required=True, available=True, message=None):
        self.required = required
        self.available = available
        super(Email, self).__init__(message)

    def __call__(self, form, field):
        if self.required or field.data:
            super(Email, self).__call__(form, field)
            if self.available:
                if User.query.filter_by(email=field.data).first() or \
                        Producer.query.filter_by(email=field.data).first() or \
                        Dealer.query.filter_by(email=field.data).first() or \
                        Privilege.query.filter_by(email=field.data).first():
                    raise ValidationError(self.message)


class Mobile(Regexp):
    def __init__(self, available=True, message=None):
        self.available = available
        super(Mobile, self).__init__(r'^1[3-8]\d{9}$', message=message)

    def __call__(self, form, field, message=None):
        if message is None:
            message = field.gettext('Invalid mobile.')
        super(Mobile, self).__call__(form, field, message)
        if self.available:
            if not available_mobile(field.data):
                raise ValidationError(u'手机号已经被绑定')


def available_mobile(mobile):
    if User.query.filter_by(mobile=mobile).first() or \
            Producer.query.filter_by(mobile=mobile).first() or \
            Dealer.query.filter_by(mobile=mobile).first():
        return False
    return True


def available_username(username):
    pass