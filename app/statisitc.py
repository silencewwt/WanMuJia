# -*- coding: utf-8 -*-
from app import db
from app.models import Category, Item, Vendor, SecondMaterial, Style, Scene, Distributor

materials = None
categories = None
styles = None
brands = None
scenes = None
item_query = None
items = None


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
    materials['available_set'] = set(materials['available'].keys())


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
    styles['available_set'] = set(styles['available'].keys())


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
    brands['available_set'] = set(brands['available'].keys())


def scenes_statistic():
    global scenes
    scenes = {'total': {}, 'available': {}, 'available_set': set()}
    for scene in Scene.query.filter_by(level=2):
        scenes['total'][scene.id] = {'scene': scene.scene}
    scene_ids = [item.scene_id for item in item_query.group_by(Item.scene_id)]
    query = db.session.query(Scene).filter(Scene.id.in_(scene_ids))
    for scene in query:
        scenes['available'][scene.id] = {'scene': scene.scene}
    scenes['available_set'] = set(scenes['available'].keys())


class DistributorAreaTree(object):
    def __init__(self):
        self.children = []

    @staticmethod
    def add_node(root, *nodes):
        for node in nodes:
            for child in root.children:
                if child.id == node.id:
                    if node.children:
                        root.add_node(child, *node.children)
                        break
                    elif root.father is not None:
                        child.distributors = child.distributors + node.distributors
                        break
            else:
                root.children.append(node)
                node.father = root

    def dumps(self):
        data = {}
        for child in self.children:
            dumps = child.dumps()
            for k in dumps:
                data[k] = dumps[k]
        return data


class DistributorAreaNode(DistributorAreaTree):
    def __init__(self, id, area, father):
        self.id = id
        self.area = area
        self.father = father
        self.distributors = None
        super(DistributorAreaNode, self).__init__()

    @staticmethod
    def _dict_key(node_dict):
        return list(node_dict.keys())[0]

    @staticmethod
    def build_from_dict(node_dict):
        key = DistributorAreaNode._dict_key(node_dict)
        node = DistributorAreaNode(key, node_dict[key]['area'], None)
        node.add_child_from_dict(node_dict[key]['children'])
        return node

    def add_child_from_dict(self, node_dict):
        key = self._dict_key(node_dict)
        node = DistributorAreaNode(key, node_dict[key]['area'], father=self)
        self.children.append(node)
        if 'children' in node_dict[key]:
            return node.add_child_from_dict(node_dict[key]['children'])
        node.distributors = node_dict[key]['distributors']

    def dumps(self):
        if self.children:
            data = {self.id: {'area': self.area, 'children': {}}}
            for child in self.children:
                dumps = child.dumps()
                for k in dumps:
                    data[self.id]['children'][k] = dumps[k]
            return data

        distributors = {}
        self.distributors = sorted(list(set(self.distributors)))
        if len(self.distributors) == 1:
            distributor = Distributor.query.get(self.distributors[0])
            distributors = {distributor.id: {'name': '%s体验馆' % self.area, 'ext_number': distributor.ext_number}}
        else:
            for index, key in zip(range(1, len(self.distributors) + 1), self.distributors):
                distributor = Distributor.query.get(key)
                distributors[key] = {'name': '%s体验馆%d' % (self.area, index), 'ext_number': distributor.ext_number}
        return {self.id: {'area': self.area, 'distributors': distributors}}


def distributors_statistic(item_id=None):
    global items
    items = {}
    if item_id is not None:
        query = [Item.query.get(item_id)]
    else:
        query = item_query
    for item in query:
        root = DistributorAreaTree()
        for distributor in item.in_stock_distributors():
            area = distributor.address.area
            root.add_node(root, DistributorAreaNode.build_from_dict(area.experience_dict(distributor.id)))
        items[item.id] = root.dumps()


def init_statistic():
    brands_statistic()
    global item_query
    item_query = db.session.query(Item).\
        filter(Item.vendor_id.in_(brands['available_set']), Item.is_deleted == False, Item.is_component == False)
    materials_statistic()
    categories_statistic()
    style_statistic()
    scenes_statistic()
    distributors_statistic()


def selected(statistic, id_list):
    return {id_: statistic[id_] for id_ in id_list if id_ in statistic}
