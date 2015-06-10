# -*- coding: utf-8 -*-
import hashlib
import random
import time

from flask import current_app

from ._compat import PY3

random.seed()


def md5(data):
    return hashlib.md5(data).hexdigest()


def md5_with_salt(*data):
    return md5(_data_convert(data + (current_app.config['MD5_SALT'],)))


def md5_with_time_salt(*data):
    return md5(_data_convert(data + (current_app.config['MD5_SALT'], time.time())))


def _data_convert(args):
    data = ''.join(list(map(str, args)))
    if PY3:
        return bytes(data, 'utf8')
    return data
