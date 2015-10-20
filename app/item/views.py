# -*- coding: utf-8 -*-
from math import ceil
from flask import render_template, request, current_app, abort, jsonify
from flask.ext.login import current_user
from flask.ext.cdn import url_for

from app import statisitc
from app.models import Item
from app.user.forms import LoginForm
from . import item as item_blueprint


@item_blueprint.route("/")
def item_list():
    return render_template("user/display.html", user=current_user)


@item_blueprint.route("/filter")
def item_filter():
    materials = request.args.getlist('material', type=int)
    styles = request.args.getlist('style', type=int)
    scenes = request.args.getlist('scene', type=int)
    brands = request.args.getlist('brand', type=int)
    categories = request.args.getlist('category', type=int)
    price = request.args.get('price', type=int)
    price_order = request.args.get('order', type=str)
    search = request.args.get('search', type=str)

    page = request.args.get('page', 1, type=int)
    price_list = ((1, 9999), (10000, 49999), (50000, 99999), (100000, 249999), (250000, 499999), (500000, 2147483647))
    price_text = ('1万以下', '1万 - 5万', '5万 - 10万', '10万 - 25万', '25万 - 50万', '50万以上')

    query = Item.query.filter(Item.is_deleted == False, Item.is_component == False)
    if brands:
        brands = list(
            statisitc.brands['available_set'] - (statisitc.brands['available_set'] - set(brands))
        )
        query = query.filter(Item.vendor_id.in_(brands))
    else:
        query = query.filter(Item.vendor_id.in_(statisitc.brands['total_set']))
    if materials:
        materials = list(
            statisitc.materials['available_set'] - (statisitc.materials['available_set'] - set(materials))
        )
        query = query.filter(Item.second_material_id.in_(materials))
    if categories:
        category_statistic_set = set([id_ for id_ in statisitc.categories['available']])
        categories = list(
            category_statistic_set - (category_statistic_set - set(categories))
        )
        category_ids = []
        for category_id in categories:
            category_ids.extend(statisitc.categories['available_list'][category_id])
        query = query.filter(Item.category_id.in_(category_ids))
    if scenes:
        scenes = list(
            statisitc.scenes['available_set'] - (statisitc.scenes['available_set'] - set(scenes))
        )
        query = query.filter(Item.second_scene_id.in_(scenes))
    if styles:
        styles = list(
            statisitc.styles['available_set'] - (statisitc.styles['available_set'] - set(styles))
        )
        query = query.filter(Item.style_id.in_(styles))
    if price is not None and 0 <= price < len(price_list):
        query.filter(Item.price >= price_list[price][0], Item.price <= price_list[price][1])
    else:
        price = None
    if search is not None and search != '':
        query.filter(Item.item.like('%' + search + '%'))
    if price_order == 'asc':
        query = query.order_by(Item.price)
    elif price_order == 'desc':
        query = query.order_by(-Item.price)
    elif price_order is not None:
        price_order = None

    items = query.paginate(page, current_app.config['ITEM_PER_PAGE'], False).items
    per_page = current_app.config['ITEM_PER_PAGE']
    amount = query.count()
    data = {
        'filters': {'available': {}, 'selected': {}},
        'items': {'amout': amount, 'page': page, 'pages': ceil(amount / per_page), "search": search,
                  "order": price_order, 'query': []}
    }
    if not brands:
        data['filters']['available']['brand'] = statisitc.brands['available']
    else:
        data['filters']['selected']['brand'] = statisitc.selected(statisitc.brands['total'], brands)
    if not materials:
        data['filters']['available']['material'] = statisitc.materials['available']
    else:
        data['filters']['selected']['material'] = statisitc.selected(statisitc.materials['total'], materials)
    if not categories:
        data['filters']['available']['category'] = statisitc.categories['available']
    else:
        data['filters']['selected']['category'] = statisitc.selected(statisitc.categories['total'], categories)
    if not scenes:
        data['filters']['available']['scene'] = statisitc.scenes['available']
    else:
        data['filters']['selected']['scene'] = statisitc.selected(statisitc.scenes['total'], scenes)
    if not styles:
        data['filters']['available']['style'] = statisitc.styles['available']
    else:
        data['filters']['selected']['style'] = statisitc.selected(statisitc.styles['total'], styles)
    if price is not None:
        data['filters']['selected']['price'] = {price: {'price': price_text[price]}}
    else:
        data['filters']['available']['price'] = {index: {'price': price_text[index]} for index in range(0, 6)}
    for item in items:
        image = item.images.first()
        image_url = image.url if image else url_for('static', filename='img/user/item_default_img.jpg')
        data['items']['query'].append({
            'id': item.id,
            'item': item.item,
            'price': item.price,
            'image_url': image_url
        })
    return jsonify(data)


@item_blueprint.route("/<int:item_id>")
def detail(item_id):
    item = Item.query.get_or_404(item_id)
    if item.is_deleted or item.is_component:
        abort(404)
    format = request.args.get('format', '', type=str)
    if format == 'json':
        if item.is_suite or item.is_component:
            return '套件商品无法对比'
        image = item.images.first()
        image_url = image.url if image else url_for('static', filename='img/user/item_default_img.jpg')
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
    return render_template("user/detail.html", item=item, user=current_user, form=LoginForm())


@item_blueprint.route('/<int:item_id>/distributors')
def distributors(item_id):
    item = Item.query.get_or_404(item_id)
    if item.is_deleted or item.is_component:
        abort(404)
    distributor_id = {'distributors': [distributor.id for distributor in item.in_stock_distributors()]}
    return jsonify(distributor_id)


@item_blueprint.route("/compare")
def compare():
    return render_template("user/compare.html", user=current_user)
