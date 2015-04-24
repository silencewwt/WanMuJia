# -*- coding: utf-8 -*-
import redis
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager
from flask.ext.mail import Mail
from flask.ext.principal import Principal
from flask_security import Security

from config import config
from permission import identity_config


app = Flask(__name__)
db = SQLAlchemy()
login_manager = LoginManager()
mail = Mail()
principal = Principal()
security = Security()

local_redis = redis.StrictRedis(host='localhost', port=6379, db=0)


def create_app(config_name):
    app.static_folder = 'static'
    app.template_folder = 'templates'
    app.config.from_object(config[config_name])
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.session_protection = 'strong'
    login_manager.login_view = 'user.login'
    mail.init_app(app)
    principal.init_app(app)
    security.init_app(app)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .user import user as user_blueprint
    app.register_blueprint(user_blueprint, url_prefix='/user')

    from .producer import producer as producer_blueprint
    app.register_blueprint(producer_blueprint, url_prefix='/producer')

    from .dealer import dealer as dealer_blueprint
    app.register_blueprint(dealer_blueprint, url_prefix='dealer')

    return app