# -*- coding: utf-8 -*-
from flask import Blueprint

privilege = Blueprint('privilege', __name__)
from . import views
