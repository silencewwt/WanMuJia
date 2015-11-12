# -*- coding: utf-8 -*-
import os
import json

basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    SECRET_KEY = 'hard string to guess'
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    DEBUG = True
    CSRF_ENABLED = True

    MD5_SALT = 'md5 salt'
    CONFIRM_EMAIL_DURATION = 86400  # seconds (24 hours)
    DISTRIBUTOR_REGISTER_DURATION = 86400
    SMS_CAPTCHA_DURATION = 600
    IMAGE_CAPTCHA_DURATION = 600
    ITEM_PER_PAGE = 40
    CDN_DOMAIN = 'static.wanmujia.com'
    CDN_TIMESTAMP = False
    CONFIG_PATH = os.path.join(basedir, 'config.json')

    ADMIN_EMAILS = []
    WMJ_MAIL_SENDER = (u'万木家', 'notification@wanmujia.com')

    @classmethod
    def init_app(cls, app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True
    IMAGE_DIR = os.path.join(basedir, 'app/static/')
    HOST = 'http://127.0.0.1:5000'

    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        with open(cls.CONFIG_PATH) as f:
            config_dict = json.load(f)['development']
        cls.SQLALCHEMY_DATABASE_URI = config_dict['DATABASE_URL']


class TestingConfig(Config):
    TESTING = True
    WTF_CSRF_ENABLED = False
    DEBUG_TB_ENABLED = False
    SERVER_NAME = 'localhost'
    IMAGE_DIR = os.path.join(basedir, 'app/static/')

    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        with open(cls.CONFIG_PATH) as f:
            config_dict = json.load(f)['testing']
        cls.SQLALCHEMY_DATABASE_URI = config_dict['DATABASE_URL']


class ProductionConfig(Config):
    DEBUG = False
    PROPAGATE_EXCEPTIONS = False
    HOST = 'http://www.wanmujia.com'
    CELERY_BROKER_URL = 'redis://localhost:6379/0'
    IMAGE_DIR = '/var/www/WanMuJia/'
    CDN_DOMAIN = 'static.wanmujia.com'

    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        with open(cls.CONFIG_PATH) as f:
            config_dict = json.load(f)['production']
        cls.SECRET_KEY = config_dict['SECRET_KEY']
        cls.MD5_SALT = config_dict['MD5_SALT']
        cls.SQLALCHEMY_DATABASE_URI = config_dict['DATABASE_URL']
        cls.ADMIN_EMAILS = config_dict['ADMIN_EMAILS']

        import logging
        file_handler = logging.FileHandler('/var/log/wmj/wmj_error.log')
        file_handler.setLevel(logging.ERROR)
        file_handler.setFormatter(logging.Formatter('\n%s\n%s' % ('-' * 30, '%(asctime)s %(levelname)s: %(message)s')))
        app.logger.addHandler(file_handler)


class CeleryConfig(Config):

    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        with open(cls.CONFIG_PATH) as f:
            config_dict = json.load(f)['celery']
        cls.SQLALCHEMY_DATABASE_URI = config_dict['DATABASE_URL']
        cls.MAIL_SERVER = config_dict['MAIL_SERVER']
        cls.MAIL_PORT = config_dict['MAIL_PORT']
        cls.MAIL_USE_SSL = config_dict['MAIL_USE_SSL']
        cls.MAIL_USERNAME = config_dict['MAIL_USERNAME']
        cls.MAIL_PASSWORD = config_dict['MAIL_PASSWORD']


config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig,
    'celery': CeleryConfig
}
