# -*- coding: utf-8 -*-
import hashlib
import random
import time

from flask import current_app, request

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


def convert_url(url):
    if url:
        return current_app.config['STATIC_URL'] + url
    return ''


def data_table_params():
    draw = request.args.get('draw', 1, type=int)
    start = request.args.get('start', 0, type=int)
    length = request.args.get('length', 100, type=int)
    valid_length = [10, 25, 50, 100]
    length = length if length in valid_length else valid_length[0]
    return draw, start, length
