# -*- coding: utf-8 -*-
from flask import render_template, request, current_app
from sqlalchemy import and_

from app import db
from app.models import Item, ItemCategory
from . import item as item_blueprint


@item_blueprint.route("/")
def item_list():
    return render_template("/item/list.html")


@item_blueprint.route("/filter")
def item_filter():
    page = request.args.get('page', 1, type=int)
    brands = request.args.getlist('brand', type=int)
    materials = request.args.getlist('material', type=int)
    categories = request.args.getlist('category', type=int)
    order = request.args.get('order', 0, type=int)
    price = request.args.getlist('price', type=int)
    price_list = ((0, 10000), (10001, 50000), (50001, 100000), (100001, 500000), (500001, 1999999999))
    query = db.session.query(Item)
    if brands:
        query = query.filter(Item.vendor_id.in_(brands))
    if materials:
        query = query.filter(Item.material_id.in_(materials))
    if categories:
        query = query.filter(Item.id == ItemCategory.item_id, ItemCategory.category_id.in_(categories))
    if price:
        price_not_in = (price_list[i] for i in range(5) if i not in price)
        # TODO: 价格筛选
        for p in price_not_in:
            query.filter(~and_(Item.price >= p[0], Item.price <= p[1]))
    if abs(order) == 1:
        query.order_by(Item.price if order > 0 else -Item.price)
    elif abs(order) == 2:
        pass
    elif abs(order) == 3:
        query.order_by(Item.created if order > 0 else -Item.created)
    items = query.paginate(page, current_app.config['ITEM_PER_PAGE'], False).items
    return render_template("/item/filter.html", items=items)


@item_blueprint.route("/detail")
def detail():
    item_id = request.args.get('id', 0, type=int)
    item = Item.query.get_or_404(item_id)
    return render_template("/item/detail.html", item=item)


@item_blueprint.route("/compare")
def compare():
    first_id = request.args.get('first', 0, type=int)
    second_id = request.args.get('second', 0, type=int)
    if first_id == second_id:
        pass  # TODO: 提示？
    first = Item.query.get_or_404(first_id)
    second = Item.query.get_or_404(second_id)
    return render_template("/item/compare.html", first=first, second=second)