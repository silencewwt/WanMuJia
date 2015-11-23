# -*- coding: utf-8 -*-
import random
import json

from flask import render_template, abort, Response
from sqlalchemy import func
from flask.ext.login import current_user

from app import statisitc
from app.models import Item, Scene
from app.utils import items_json
from app.utils.redis import redis_set, redis_get
from .import main


@main.route('/')
def index():
    item_ids = redis_get('INDEX_ITEMS', 'ITEMS')
    if item_ids:
        item_ids = json.loads(item_ids)
    else:
        items = statisitc.item_query.order_by(func.rand()).limit(18).all()
        item_ids = [item.id for item in items]
        redis_set('INDEX_ITEMS', 'ITEMS', json.dumps(item_ids), expire=86400)
    items = Item.query.filter(Item.id.in_(item_ids)).order_by(Item.id).all()
    while len(items) < 18:
        items.append(items[0])
    scenes = []
    for first_scene in Scene.query.filter_by(level=1).order_by(Scene.id):
        l = [(first_scene.id, first_scene.scene), []]
        for scene in Scene.query.filter_by(father_id=first_scene.id).order_by(Scene.id):
            l[1].append((scene.id, scene.scene))
        scenes.append(l)
    return render_template('user/index.html', user=current_user, scenes=scenes,
                           group1=items[:6], group2=items[6:12], group3=items[12:18])


@main.route('/navbar')
def navbar():
    data = redis_get('INDEX_NAVBAR', 'ITEMS')
    if data is None:
        data = {}
        for scene_id in range(3, 6):
            item_ids = redis_get('INDEX_NAVBAR_%d' % scene_id, 'ITEMS')
            if item_ids:
                item_ids = json.loads(item_ids)
            else:
                item_list = statisitc.item_query.filter(Item.scene_id == scene_id).all()
                item_ids = [random.SystemRandom().choice(item_list).id for _ in range(8)]
                redis_set('INDEX_NAVBAR_%d' % scene_id, 'ITEMS', json.dumps(item_ids), expire=86400)
            scene = Scene.query.get(scene_id)
            data[scene.id] = {'scene': scene.scene, 'items': items_json(item_ids)}
        data = json.dumps(data)
        redis_set('INDEX_NAVBAR', 'ITEMS', data, expire=86400)
    return Response(data, mimetype='application/json')


@main.route('/brands')
def brand_list():
    data = redis_get('BRANDS', 'ITEMS')
    if data is None:
        brands = statisitc.brands['total']
        data = {vendor_id: {'brand': brands[vendor_id]['brand']} for vendor_id in brands}
        for vendor_id in data:
            item_list = Item.query.filter(Item.vendor_id == vendor_id, Item.is_deleted == False,
                                          Item.is_component == False).all()
            items = [random.SystemRandom().choice(item_list) for _ in range(5)]
            data[vendor_id]['items'] = items_json(items)
        data = json.dumps(data)
        redis_set('BRANDS', 'ITEMS', data, expire=86400)
    return Response(data, mimetype='application/json')


@main.route('/brands/<int:vendor_id>')
def vendor_detail(vendor_id):
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


@main.route('/legal/<string:role>')
def legal(role):
    if role == 'user':
        return render_template('site/user_legal.html', user=current_user)
    elif role == 'vendor':
        return render_template('site/vendor_legal.html', user=current_user)
    abort(404)


@main.route('/about')
def about():
    return render_template('site/about.html', user=current_user)


@main.route('/join')
def join():
    return render_template('site/join.html', user=current_user)


@main.route('/center')
def center():
    return render_template('site/center.html', user=current_user)
