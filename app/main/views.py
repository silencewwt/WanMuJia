# -*- coding: utf-8 -*-
import random
import json

from flask import render_template, abort, Response, request
from flask.ext.login import current_user

from app import statisitc
from app.models import Item, Scene
from app.utils import items_json
from app.utils.redis import redis_set, redis_get
from .import main


@main.route('/')
def index():
    return render_template('user/index.html')


@main.route('/navbar')
def navbar():
    data = redis_get('INDEX_NAVBAR', 'ITEMS')
    if data is None:
        data = {}
        for scene_id in range(3, 6):
            scene = Scene.query.get(scene_id)
            item_list = statisitc.item_query.filter(Item.scene_id == scene_id).all()
            if not item_list:
                items = []
            else:
                items = [random.SystemRandom().choice(item_list) for _ in range(8)]
            data[scene.id] = {'scene': scene.scene, 'items': items_json(items)}
        data = json.dumps(data)
        redis_set('INDEX_NAVBAR', 'ITEMS', data, expire=86400)
    return Response(data, mimetype='application/json')


@main.route('/brands')
def brand_list():
    format = request.args.get('format', '', type=str)
    if format == 'json':
        data = redis_get('BRAND', 'ITEMS')
        if data is None:
            brands = statisitc.brands['total']
            data = {vendor_id: {'brand': brands[vendor_id]['brand']} for vendor_id in brands}
            for vendor_id in data:
                item_list = Item.query.filter(Item.vendor_id == vendor_id, Item.is_deleted == False,
                                              Item.is_component == False).all()
                items = [random.SystemRandom().choice(item_list) for _ in range(5)]
                data[vendor_id]['items'] = items_json(items)
            data = json.dumps(data)
            redis_set('BRAND', 'ITEMS', data, expire=86400)
        return Response(data, mimetype='application/json')
    return render_template('user/brands.html')


@main.route('/brands/<int:vendor_id>')
def vendor_detail(vendor_id):
    format = request.args.get('format', '', type=str)
    if format == 'json':
        data = redis_get('BRAND_ITEMS', vendor_id)
        if data is None:
            data = {}
            for scene_id in range(2, 6):
                scene = Scene.query.get(scene_id)
                item_list = statisitc.item_query.filter(Item.vendor_id == vendor_id, Item.scene_id == scene_id).all()
                if not item_list:
                    continue
                items = [random.SystemRandom().choice(item_list) for _ in range(10)]
                data[scene_id] = {'scene': scene.scene, 'items': items_json(items)}
            data = json.dumps(data)
            redis_set('BRAND_ITEMS', vendor_id, data, expire=86400)
        return Response(data, mimetype='application/json')
    return render_template('user/brand_detail.html')


@main.route('/furniture')
def furniture():
    format = request.args.get('format', '', type=str)
    if format == 'json':
        data = redis_get('STYLE', 'ITEMS')
        if data is None:
            styles = statisitc.styles['available']
            data = {style_id: {'style': styles[style_id]['style']} for style_id in styles}
            for style_id in data:
                item_list = Item.query.filter(Item.style_id == style_id).all()
                items = [random.SystemRandom().choice(item_list) for _ in range(8)]
                data[style_id]['items'] = items_json(items)
            data = json.dumps(data)
            redis_set('STYLE', 'ITEMS', data, expire=86400)
        return Response(data, mimetype='application/json')
    return render_template('user/furniture.html')


@main.route('/about')
def about():
    return render_template('user/about.html')
