# -*- coding: utf-8 -*-
import os


basedir = os.path.abspath(os.path.dirname(__file__))


class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or \
        '\xd7\x98\x0e\xbd\x00\xfb\xa8R\x8e\xc3\x17\xc5\xb5"\x08\xec\x06\x9a\xda~\xa5\xf3#\x1b1\x97\xd7P\xd9QO+'
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    DEBUG = True
    CSRF_ENABLED = True

    MD5_SALT = os.environ.get('MD5_SALT') or \
        '\xde6\xfd\xc3\x1fZ\x85\xc3\x91\x93\xb7^D\xb5\\\x87p\x8bF\x97\x8c\xe6\xdbt\xe3\x8e\xd4 \x08\x16\xc7\xc9'
    CONFIRM_EMAIL_DURATION = 86400  # seconds (24 hours)
    DISTRIBUTOR_REGISTER_DURATION = 86400
    SMS_CAPTCHA_DURATION = 600
    IMAGE_CAPTCHA_DURATION = 600
    ITEM_PER_PAGE = 40
    CDN_DOMAIN = 'static.wanmujia.com'
    CDN_TIMESTAMP = False

    ADMIN_EMAILS = []
    WMJ_MAIL_SENDER = (u'万木家', 'notification@wanmujia.com')

    @classmethod
    def init_app(cls, app):
        pass


class DevelopmentConfig(Config):
    DEBUG = True
    IMAGE_DIR = os.path.join(basedir, 'app/static/')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'mysql+pymysql://dev:devpassword@localhost/wmj?charset=utf8'
    CELERY_BROKER_URL = 'redis://localhost:6379/0'
    STATIC_URL = 'http://127.0.0.1:5000/'
    HOST = 'http://127.0.0.1:5000'

    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        import json
        with open('config.json') as f:
            config_dict = json.load(f)
            cls.SQLALCHEMY_DATABASE_URI = config_dict['DEV_DATABASE_URL']


class TestingConfig(Config):
    TESTING = True
    CSRF_ENABLED = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
        'mysql+pymysql://test:testpassword@localhost/test?charset=utf8'

    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        pass


class ProductionConfig(Config):
    DEBUG = False
    PROPAGATE_EXCEPTIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    STATIC_URL = 'http://static.wanmujia.com/'
    HOST = 'http://www.wanmujia.com'
    CELERY_BROKER_URL = 'redis://localhost:6379/0'
    IMAGE_DIR = '/var/www/WanMuJia/'
    CDN_DOMAIN = 'static.wanmujia.com'

    @classmethod
    def init_app(cls, app):
        Config.init_app(app)
        import json
        with open('/var/www/WanMuJia/config.json') as f:
            config_dict = json.load(f)
            cls.SECRET_KEY = config_dict['SECRET_KEY']
            cls.MD5_SALT = config_dict['MD5_SALT']
            cls.SQLALCHEMY_DATABASE_URI = config_dict['DATABASE_URL']
            cls.ADMIN_EMAILS = config_dict['ADMIN_EMAILS']

        import logging
        file_handler = logging.FileHandler('/var/log/wmj/wmj_error.log')
        file_handler.setLevel(logging.ERROR)
        file_handler.setFormatter(logging.Formatter('\n%s\n%s' % ('-' * 30, '%(asctime)s %(levelname)s: %(message)s')))
        app.logger.addHandler(file_handler)


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
