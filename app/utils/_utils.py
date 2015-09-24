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


class DataTableHandler(object):
    def __init__(self, params):
        self.params = params
        self.start = None
        self.length = None
        self.data = {'data': []}
        self.parse_request_params()

    def parse_request_params(self):
        draw = request.args.get('draw', 1, type=int)
        self.data['draw'] = draw + 1
        self.start = request.args.get('start', 0, type=int)
        length = request.args.get('length', 10, type=int)
        valid_length = [10, 25, 50, 100]
        self.length = length if length in valid_length else valid_length[0]

    def query_params(self, query):
        self.data['recordsTotal'] = query.count()
        order_column = request.args.get('order[0][column]', '')
        order_key = request.args.get('columns[%s][data]' % order_column)
        order_dir = request.args.get('order[0][dir]')
        if order_key is not None and order_key in self.params and self.params[order_key]['orderable']:
            if order_dir == 'desc':
                query = query.order_by(-self.params[order_key]['order_key'])
            else:
                query = query.order_by(self.params[order_key]['order_key'])
        query = query.offset(self.start).limit(self.length)
        self.data['recordsFiltered'] = query.count()
        for record in query:
            data = {}
            for param in self.params:
                data[param] = self.params[param]['data'](record)
            self.data['data'].append(data)
        return self.data


def data_table_params():
    draw = request.args.get('draw', 1, type=int)
    start = request.args.get('start', 0, type=int)
    length = request.args.get('length', 100, type=int)
    valid_length = [10, 25, 50, 100]
    length = length if length in valid_length else valid_length[0]
    return draw, start, length
