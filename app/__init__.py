# -*- coding: utf-8 -*-
import redis
from flask import Flask, render_template, request, redirect, url_for
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager
from flask.ext.principal import Principal
from flask.ext.cdn import CDN
from flask.ext.mail import Mail
from flask_debugtoolbar import DebugToolbarExtension

from config import config
from .permission import identity_config
from .utils.filters import *

db = SQLAlchemy()
login_manager = LoginManager()
principal = Principal()
cdn = CDN()
toolbar = DebugToolbarExtension()
mail = Mail()
local_redis = redis.StrictRedis(host='localhost', port=6379, db=0)


def create_app(config_name):
    app = Flask(__name__, static_url_path='')
    app.static_folder = 'static'
    app.template_folder = 'templates'
    config[config_name].init_app(app)
    app.config.from_object(config[config_name])
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.session_protection = 'basic'
    login_manager.login_view = 'user.login'
    principal.init_app(app)
    identity_config(app)
    toolbar.init_app(app)
    cdn.init_app(app)

    app.jinja_env.filters['date'] = date

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .user import user as user_blueprint
    app.register_blueprint(user_blueprint)

    from .vendor import vendor as vendor_blueprint
    app.register_blueprint(vendor_blueprint, url_prefix='/vendor')

    from .item import item as item_blueprint
    app.register_blueprint(item_blueprint, url_prefix='/item')

    from .distributor import distributor as distributor_blueprint
    app.register_blueprint(distributor_blueprint, url_prefix='/distributor')

    from .privilege import privilege as privilege_blueprint
    app.register_blueprint(privilege_blueprint, url_prefix='/privilege')

    from .service import service as service_blueprint
    app.register_blueprint(service_blueprint, url_prefix='/service')

    @app.after_request
    def set_csrf_token_cookie(response):
        csrf_token = getattr(request, 'csrf_token', None)
        if csrf_token is not None:
            response.set_cookie('csrf_token', csrf_token, max_age=3600)
        return response

    @app.errorhandler(404)
    def page_not_found(error):
        return render_template('user/404.html'), 404

    if config_name != 'testing':
        from app import statisitc
        with app.app_context():
            statisitc.init_statistic()

    return app


def create_celery_app():
    app = Flask(__name__)
    config['celery'].init_app(app)
    app.config.from_object(config['celery'])
    db.init_app(app)
    mail.init_app(app)
    return app
