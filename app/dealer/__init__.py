# -*- coding: utf-8 -*-
from flask import Blueprint

dealer = Blueprint('dealer', __name__)
from .views import *