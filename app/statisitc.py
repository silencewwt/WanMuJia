# -*- coding: utf-8 -*-
from app import db
from app.models import Category, Item, Vendor, SecondScene, SecondMaterial, Style

materials = None
categories = None
styles = None
brands = None
scenes = None
item_query = None


def materials_statistic():
    global materials
    materials = {'total': {}, 'available': {}, 'available_set': set()}
    query = SecondMaterial.query
    for second_material in query:
        materials['total'][second_material.id] = {'material': second_material.second_material}

    second_material_ids = [item.second_material_id for item in item_query.group_by(Item.second_material_id)]
    query = query.filter(SecondMaterial.id.in_(second_material_ids))
    for second_material in query:
        materials['available'][second_material.id] = {'material': second_material.second_material}
    materials['available_set'] = set([second_material.id for second_material in query])


def categories_statistic():
    global categories
    categories = {'total': {}, 'available': {}, 'available_list': {}}
    for category in Category.query.filter(Category.level == 1):
        categories['total'][category.id] = {'category': category.category}

    category_ids = [item.category_id for item in item_query.group_by(Item.category_id)]
    query = db.session.query(Category).filter(Category.id.in_(
        db.session.query(Category.father_id).filter(Category.id.in_(
            db.session.query(Category.father_id).filter(Category.id.in_(
                category_ids
            ))
        ))
    ))
    for category in query:
        categories['available'][category.id] = {'category': category.category}
    for id_ in categories['available']:
        second_category_ids = db.session.query(Category.id).filter(Category.father_id == id_)
        third_category_ids = db.session.query(Category.id).filter(Category.father_id.in_(second_category_ids))
        id_list = []
        id_list.extend([_[0] for _ in second_category_ids])
        id_list.extend([_[0] for _ in third_category_ids])
        categories['available_list'][id_] = id_list


def style_statistic():
    global styles
    styles = {'total': {}, 'available': {}, 'available_set': set()}
    for style in Style.query:
        styles['total'][style.id] = {'style': style.style}

    style_ids = [item.style_id for item in item_query.group_by(Item.style_id)]
    query = db.session.query(Style).filter(Style.id.in_(style_ids))
    for style in query:
        styles['available'][style.id] = {'style': style.style}
    styles['available_set'] = set([style.id for style in query])


def brands_statistic():
    global brands
    brands = {'total': {}, 'total_set': set(), 'available': {}, 'available_set': set()}
    query = Vendor.query.filter(Vendor.confirmed == True)
    for vendor in query:
        brands['total'][vendor.id] = {'brand': vendor.brand}
    brands['total_set'] = set([vendor.id for vendor in query])

    vendor_ids = db.session.query(Item.vendor_id).group_by(Item.vendor_id)
    query = query.filter(Vendor.id.in_(vendor_ids))
    for vendor in query:
        brands['available'][vendor.id] = {'brand': vendor.brand}
    brands['available_set'] = set([vendor.id for vendor in query])


def scenes_statistic():
    global scenes
    scenes = {'total': {}, 'available': {}, 'available_set': set()}
    query = SecondScene.query
    for second_scene in query:
        scenes['total'][second_scene.id] = {'scene': second_scene.second_scene}

    second_scene_ids = [item.second_scene_id for item in item_query.group_by(Item.second_scene_id)]
    query = query.filter(SecondScene.id.in_(second_scene_ids))
    for second_scene in query:
        scenes['available'][second_scene.id] = {'scene': second_scene.second_scene}
    scenes['available_set'] = set([second_scene.id for second_scene in query])


def init_statistic():
    brands_statistic()
    global item_query
    item_query = db.session.query(Item).\
        filter(Item.vendor_id.in_(brands['available_set']), Item.is_deleted == False, Item.is_component == False)
    materials_statistic()
    categories_statistic()
    style_statistic()
    scenes_statistic()


def selected(statistic, id_list):
    return {id_: statistic[id_] for id_ in id_list if id_ in statistic}
