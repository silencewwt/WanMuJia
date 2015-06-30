# -*- coding: utf-8 -*-
from flask import Blueprint

service = Blueprint('service', __name__)
from . import views
