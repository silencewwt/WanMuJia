# -*- coding: utf-8 -*-
import random
import json

from flask import render_template, abort, jsonify
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


@main.route('/navbar/<int:num>')
def navbar(num):
    if num not in (1, 2):
        abort(404)
    item_ids = redis_get('INDEX_NAVBAR_%d' % num, 'ITEMS')
    if item_ids:
        item_ids = json.loads(item_ids)
    else:
        item_list = statisitc.item_query.filter(Item.scene_id == 2 + num).all()
        item_ids = [random.SystemRandom().choice(item_list).id for _ in range(8)]
        redis_set('INDEX_NAVBAR_%d' % num, 'ITEMS', json.dumps(item_ids), expire=86400)
    data = {'items': items_json(item_ids)}
    return jsonify(data)


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
