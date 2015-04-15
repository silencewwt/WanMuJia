# -*- coding: utf-8 -*-
from flask import Blueprint

producer = Blueprint('producer', __name__)
from . import views