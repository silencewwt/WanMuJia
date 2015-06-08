# -*- coding: utf-8 -*-
from flask import Blueprint

vendor = Blueprint('vendor', __name__)
from . import views
