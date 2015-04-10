# -*- coding: utf-8 -*-
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.login import LoginManager
from flask.ext.principal import Principal
from flask_security import Security

from config import config
from permission import identity_config


app = Flask(__name__)
db = SQLAlchemy()
login_manager = LoginManager()
principal = Principal()
security = Security()


def create_app(config_name):
    app.static_folder = 'static'
    app.template_folder = 'templates'
    app.config.from_object(config[config_name])
    db.init_app(app)
    login_manager.init_app(app)
    login_manager.session_protection = 'strong'
    login_manager.login_view = 'user.login'
    principal.init_app(app)
    security.init_app(app)

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .user import user as user_blueprint
    app.register_blueprint(user_blueprint, url_prefix='/user')

    return app