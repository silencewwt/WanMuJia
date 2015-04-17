# -*- coding: utf-8 -*-
import json

from flask import current_app

from app import local_redis
from app.constants import REG_TOKEN


def redis_set(content_type, key, value, expire=None, **kwargs):
    if content_type == REG_TOKEN:
        value = json.dumps(dict(
            password=kwargs['password'],
            email=kwargs['email']
        ))
    key = '%s:%s' % (content_type, key)
    expire = expire if expire else current_app.config['%s_DURATION' % content_type]
    local_redis.set(key, value, expire)


def redis_get(content_type, key, **kwargs):
    key = '%s:%s' % (content_type, key)
    value = local_redis.get(key)
    if content_type == REG_TOKEN and value is not None:
        value = json.loads(value)
    return value


def redis_verify(content_type, key, value):
    return value == redis_get(content_type, key)