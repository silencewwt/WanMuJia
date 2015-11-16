# -*- coding: utf-8 -*-
from app import db
from app.models import Category, Item, Vendor, SecondMaterial, Style, Scene

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
    category_list = Category.query.order_by(Category.id).all()
    first_category = second_category = None
    for category in category_list:
        if category.level == 1:
            categories['total'][category.id] = {'category': category.category, 'children': {}}
            first_category = categories['total'][category.id]
        elif category.level == 2:
            first_category['children'][category.id] = {'category': category.category, 'children': {}}
            second_category = first_category['children'][category.id]
        else:
            second_category['children'][category.id] = {'category': category.category}

    category_ids = [item.category_id for item in item_query.filter_by(is_suite=False).group_by(Item.category_id)]

    del_list = []
    length = len(category_list)
    for index in range(length):
        if index < length - 1:
            if category_list[index].level >= category_list[index + 1].level:
                if category_list[index].id not in category_ids:
                    del_list.append(category_list[index])
        else:
            if category_list[index].id not in category_ids:
                del_list.append(category_list[index])
    for category in del_list:
        category_list.remove(category)

    first_category = second_category = None
    for category in category_list:
        if category.level == 1:
            categories['available'][category.id] = {'category': category.category, 'children': {}}
            first_category = categories['available'][category.id]
        elif category.level == 2:
            first_category['children'][category.id] = {'category': category.category, 'children': {}}
            second_category = first_category['children'][category.id]
        else:
            second_category['children'][category.id] = {'category': category.category}

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
    first_scene = None
    scene_list = Scene.query.order_by(Scene.id).all()
    for scene in scene_list:
        if scene.level == 1:
            scenes['total'][scene.id] = {'scene': scene.scene, 'children': {}}
            first_scene = scenes['total'][scene.id]
        else:
            first_scene['children'][scene.id] = {'scene': scene.scene}

    scene_ids = [item.scene_id for item in item_query.group_by(Item.scene_id)]

    del_list = []
    for scene in scene_list:
        if scene.level == 2 and scene.id not in scene_ids:
            del_list.append(scene)
    for scene in del_list:
        scene_list.remove(scene)

    first_scene = None
    for scene in scene_list:
        if scene.level == 1:
            scenes['available'][scene.id] = {'scene': scene.scene, 'children': {}}
            first_scene = scenes['available'][scene.id]
        else:
            first_scene['children'][scene.id] = {'scene': scene.scene}


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
