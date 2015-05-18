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
    first_id = request.args.get('first', 0, type=int)
    second_id = request.args.get('second', 0, type=int)
    if first_id == second_id:
        pass  # TODO: 提示？
    first = Item.query.get_or_404(first_id)
    second = Item.query.get_or_404(second_id)
    return render_template("/item/compare.html", first=first, second=second)