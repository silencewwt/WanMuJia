# -*- coding: utf-8 -*-
import json

from flask import current_app

from app import local_redis


def redis_set(content_type, key, value=None, expire=None, **kwargs):
    if content_type == 'REG_TOKEN':
        key = '%s:%s' % (content_type, key)
        value = json.dumps(dict(
            password=kwargs['password'],
            email=kwargs['email']
        ))
        expire = expire if expire else current_app.config['CONFIRM_EMAIL_DURATION']
        local_redis.set(key, value, expire)
    elif content_type == 'SMS_CAPTCHA':
        key = '%s:%s' % (content_type, key)
        expire = expire if expire else current_app.config['SMS_CAPTCHA_DURATION']
        local_redis.set(key, value, expire)


def redis_get(content_type, key, **kwargs):
    if content_type == 'REG_TOKEN':
        key = '%s:%s' % (content_type, key)
        value = local_redis.get(key)
        if value is not None:
            value = json.loads(value)
        return value
    elif content_type == 'SMS_CAPTCHA':
        key = '%s:%s' % (content_type, key)
        return local_redis.get(key)