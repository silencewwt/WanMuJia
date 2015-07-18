# -*- coding: utf-8 -*-
import json

from flask import current_app

from app import local_redis
from app.constants import CONFIRM_EMAIL, REGISTER_ACTION, IMAGE_CAPTCHA


def redis_set(content_type, key, value, expire=None, **kwargs):
    if content_type == CONFIRM_EMAIL:
        value_dict = {
            'email': kwargs['email'],
            'action': kwargs['action']
        }
        if kwargs['action'] == REGISTER_ACTION:
            value_dict['password'] = kwargs['password']
        value = json.dumps(value_dict)
    key = '%s:%s' % (content_type, key)
    expire = expire if expire else current_app.config['%s_DURATION' % content_type]
    local_redis.set(key, value, expire)


def redis_get(content_type, key, delete=False, **kwargs):
    key = '%s:%s' % (content_type, key)
    value = local_redis.get(key)
    if value:
        value = value.decode()
    if value and delete:
        local_redis.delete(key)
    if content_type == CONFIRM_EMAIL and value is not None:
        value = json.loads(value)
    if content_type == IMAGE_CAPTCHA and value != '':
        token = key[-32:]
        redis_set(IMAGE_CAPTCHA, token, '', 7200)
    return value


def redis_verify(content_type, key, value):
    return value == redis_get(content_type, key)
