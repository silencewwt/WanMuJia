# -*- coding: utf-8 -*-
from flask import render_template, request

from app import db
from app.models import Item
from . import item as item_blueprint


@item_blueprint.route("/list")
def item_list():
    pass


@item_blueprint.route("/filter")
def item_filter():
    pass


@item_blueprint.route("/detail")
def detail():
    pass


@item_blueprint.route("/compare")
def compare():
    pass