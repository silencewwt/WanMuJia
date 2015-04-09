# -*- coding: utf-8 -*-
import os
import redis
from datetime import timedelta


basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    # TODO: add a random string as the default SECRET_KEY.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hard to guess string'
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    local_redis = redis.StrictRedis(host='localhost', port=6379, db=0)
    DEBUG = True
    CSRF_ENABLED = True
    SECURITY_PASSWORD_HASH = 'sha512_crypt'
    SECURITY_PASSWORD_SALT = 'password_salt'
    REMEMBER_COOKIE_DURATION = timedelta(7)


class DevelopmentConfig(Config):
    DEBUG = True
    IMAGE_DIR = os.path.join(basedir, 'app/static/images')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'mysql+pymysql://dev:devpassword@localhost/myj?charset=utf8'


class TestingConfig(Config):
    TESTING = True
    CSRF_ENABLED = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'mysql+pymysql://test:testpassword@localhost/test?charset=utf8'


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'mysql+pymysql://dev:devpassword@localhost/myj?charset=utf8'


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
