# -*- coding: utf-8 -*-
from flask import render_template, request, current_app, abort, jsonify
from sqlalchemy import and_

from app import db
from app.models import Item
from . import item as item_blueprint


@item_blueprint.route("/")
def item_list():
    return render_template("user/list.html")


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
        pass
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
    return render_template("user/filter.html", items=items)


@item_blueprint.route("/<int:item_id>")
def detail(item_id):
    item = Item.query.get_or_404(item_id)
    if item.is_deleted:
        abort(404)
    format = request.args.get('format', '', type=str)
    if format == 'json':
        if item.is_suite or item.is_component:
            return '套件商品无法对比'
        image = item.images.first()
        image_url = image.url if image else ''
        item_dict = {
            'item': item.item,
            'price': item.price,
            'second_material': item.second_material,
            'category': item.category,
            'second_scene': item.second_scene,
            'outside_sand': item.outside_sand,
            'inside_sand': item.inside_sand,
            'size': item.size(),
            'area': item.area if item.area else '——',
            'stove': item.stove,
            'paint': item.paint,
            'decoration': item.decoration,
            'story': item.story,
            'image_url': image_url,
            'carve': item.carve,
            'tenon': item.tenon
        }
        return jsonify(item_dict)
    return render_template("user/detail.html", item=item)


@item_blueprint.route('/<int:item_id>/distributors')
def distributors(item_id):
    item = Item.query.get_or_404(item_id)
    if item.is_deleted or item.is_component:
        abort(404)
    distributor_id = {'distributors': [distributor.id for distributor in item.in_stock_distributors()]}
    return jsonify(distributor_id)


@item_blueprint.route("/compare")
def compare():
    return render_template("user/compare.html")
