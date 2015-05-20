# -*- coding: utf-8 -*-
from flask import Blueprint

distributor = Blueprint('distributor', __name__)
from .views import *