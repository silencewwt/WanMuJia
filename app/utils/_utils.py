# -*- coding: utf-8 -*-
import hashlib
import random
import time

from flask import current_app

from ._compat import PY3

random.seed()


def md5(*data):
    return hashlib.md5(_data_convert(data)).hexdigest()


def md5_with_salt(*data):
    return md5(_data_convert(data + (current_app.config['MD5_SALT'],)))


def md5_with_timestamp_salt(*data):
    return md5_with_salt(_data_convert(data + (time.time(),)))


def _data_convert(args):
    data = ''.join(list(map(str, args)))
    if PY3:
        data = bytes(data)
    return data
