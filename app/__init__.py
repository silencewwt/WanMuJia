# -*- coding: utf-8 -*-
import redis
from flask import Flask, render_template, request, redirect, url_for
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager
from flask.ext.principal import Principal
from flask.ext.cdn import CDN

from config import config
from .permission import identity_config
from .utils.filters import *

app = Flask(__name__, static_url_path='')
db = SQLAlchemy()
login_manager = LoginManager()
principal = Principal()
cdn = CDN()

local_redis = redis.StrictRedis(host='localhost', port=6379, db=0)


def create_app(config_name):
    app.static_folder = 'static'
    app.template_folder = 'templates'
    app.config.from_object(config[config_name])
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.session_protection = 'strong'
    login_manager.login_view = 'user.login'
    principal.init_app(app)
    identity_config(app)
    cdn.init_app(app)

    app.jinja_env.filters['date'] = date

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .user import user as user_blueprint
    app.register_blueprint(user_blueprint, url_prefix='/user')

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

    @app.errorhandler(403)
    def forbid(error):
        pieces = request.url.split('/')
        if len(pieces) < 3 or 'user' == pieces[3]:
            return redirect(url_for('user.login', next=request.url))
        elif 'vendor' == pieces[3]:
            return redirect(url_for('vendor.login', next=request.url))
        elif 'distributor' == pieces[3]:
            return redirect(url_for('distributor.login', next=request.url))
        return error.name, 403

    @app.errorhandler(404)
    def page_not_found(error):
        return render_template('user/404.html'), 404

    return app


def create_mail_app():
    mail_app = Flask(__name__)
    mail_app.config.from_object(config['mail'])
    return mail_app
