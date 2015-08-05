# -*- coding: utf-8 -*-
import os
from datetime import timedelta


basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    # TODO: add a random string as the default SECRET_KEY.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'hard to guess string'
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    DEBUG = True
    CSRF_ENABLED = True
    MD5_SALT = 'md5_salt'
    STATIC_URL = 'http://127.0.0.1:5000/'
    HOST = 'http://www.wanmujia.com'
    REMEMBER_COOKIE_DURATION = timedelta(7)
    CONFIRM_EMAIL_DURATION = 86400  # seconds (24 hours)
    DISTRIBUTOR_REGISTER_DURATION = 86400
    SMS_CAPTCHA_DURATION = 600  # seconds
    IMAGE_CAPTCHA_DURATION = 600  # seconds
    ITEM_PER_PAGE = 40
    WMJ_MAIL_SENDER = (u'万木家', 'notification@wanmujia.com')


class DevelopmentConfig(Config):
    DEBUG = True
    IMAGE_DIR = os.path.join(basedir, 'app/static/')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'mysql+pymysql://dev:devpassword@localhost/wmj?charset=utf8'
    CELERY_BROKER_URL = 'redis://localhost:6379/0'
    HOST = 'http://127.0.0.1:5000'


class TestingConfig(Config):
    TESTING = True
    CSRF_ENABLED = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'mysql+pymysql://test:testpassword@localhost/test?charset=utf8'


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'mysql+pymysql://dev:devpassword@localhost/wmj?charset=utf8'


class MailConfig(Config):
    MAIL_SERVER = 'smtp.exmail.qq.com'
    MAIL_PORT = 465
    MAIL_USE_SSL = True
    MAIL_USERNAME = 'notification@wanmujia.com'
    MAIL_PASSWORD = 'WMJ0241ntfc'


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig,
    'mail': MailConfig
}
