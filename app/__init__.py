# -*- coding: utf-8 -*-
from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from config import config

app = None
db = SQLAlchemy()


def create_app(config_name):
    global app
    app = Flask(__name__, static_folder='static', template_folder='templates')
    app.config.from_object(config[config_name])
    db.init_app(app)

    return app