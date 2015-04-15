# -*- coding: utf-8 -*-
import hashlib
import random

from flask import current_app

random.seed()


def md5(data):
    return hashlib.md5(data).hexdigest()


def md5_with_salt(data):
    return md5(data + current_app.config['MD5_SALT'])