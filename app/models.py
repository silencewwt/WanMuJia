# -*- coding: utf-8 -*-
import time
import random

from flask import current_app
from flask.ext.login import UserMixin
from flask_security.utils import encrypt_password, verify_password

from app import db, login_manager
from permission import admin_id_prefix, producer_id_prefix, dealer_id_prefix, user_id_prefix


class BaseUser(UserMixin):
    # id
    id = db.Column(db.Integer, primary_key=True)
    # 哈希后的密码
    password_hash = db.Column('password', db.String(120), nullable=False)
    # 手机号码
    mobile = db.Column(db.CHAR(11), unique=True, nullable=False)
    # 邮箱
    email = db.Column(db.String(64), nullable=False)
    # 注册时间
    created = db.Column(db.Integer, default=time.time, nullable=False)

    def __init__(self, password, mobile, email):
        self.password = password
        self.mobile = mobile
        self.email = email

    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')

    @password.setter
    def password(self, password):
        self.password_hash = encrypt_password(password)

    def verify_password(self, password):
        return verify_password(password, self.password_hash)


class User(BaseUser, db.Model):
    __tablename__ = 'users'
    # 用户名
    username = db.Column(db.Unicode(20), unique=True, nullable=False)

    def __init__(self, password, mobile, email, username=u''):
        super(User, self).__init__(password, mobile, email)
        self.username = username if username else self.generate_username()

    def get_id(self):
        return user_id_prefix + unicode(self.id)

    @staticmethod
    def generate_username():
        prefix = u'用户'
        while 1:
            username = u'%s%s' % (prefix, random.randint(100000, 999999))
            if not User.query.filter_by(username=username).first():
                return username


class Collection(db.Model):
    __tablename__ = 'collections'
    # id
    id = db.Column(db.Integer, primary_key=True)
    # 用户id
    user_id = db.Column(db.Integer, nullable=False)
    # 商品id
    goods_id = db.Column(db.Integer, nullable=False)
    # 创建时间
    created = db.Column(db.Integer, default=time.time, nullable=False)


class Order(db.Model):
    __tablename__ = 'orders'
    # id
    id = db.Column(db.Integer, primary_key=True)
    # 用户id
    user_id = db.Column(db.Integer, nullable=False)
    # 用户收货地址id
    user_address_id = db.Column(db.Integer, nullable=False)
    # 商家id
    dealer_id = db.Column(db.Integer, nullable=False)
    # 商品id
    goods_id = db.Column(db.Integer, nullable=False)
    # 创建时间
    created = db.Column(db.Integer, default=time.time, nullable=False)
    # 定金
    deposit = db.Column(db.Integer, nullable=False)
    # 定金已支付
    deposit_payed = db.Column(db.Boolean, default=False, nullable=False)
    # 价格
    price = db.Column(db.Integer, nullable=False)
    # 钱款已支付
    price_payed = db.Column(db.Boolean, default=False, nullable=False)


class Producer(BaseUser, db.Model):
    __tablename__ = 'producers'
    # logo图片
    logo = db.Column(db.String(255), default='', nullable=False)
    # 法人真实姓名
    legal_person_name = db.Column(db.Unicode(10), nullable=False)
    # 法人身份证号码
    legal_person_identity = db.Column(db.CHAR(18), nullable=False)
    # 品牌厂家名称
    name = db.Column(db.Unicode(30), unique=True, nullable=False)
    # 营业执照注册号
    license_identity = db.Column(db.String(20), nullable=False)
    # 营业执照所在地
    license_address = db.Column(db.Unicode(30), nullable=False)
    # 营业执照期限
    license_limit = db.Column(db.Integer, nullable=False)
    # 长期印业执照
    license_long_time_limit = db.Column(db.Boolean, default=False, nullable=False)
    # 营业执照副本扫描件
    license_image = db.Column(db.String(255), nullable=False)
    # 地址 id
    address_id = db.Column(db.Integer, nullable=False)
    # 联系手机
    contact_mobile = db.Column(db.CHAR(11), nullable=False)
    # 联系电话
    contact_telephone = db.Column(db.CHAR(15), nullable=False)

    def __init__(self, password, mobile, email):
        super(Producer, self).__init__(password, mobile, email)

    def get_id(self):
        return producer_id_prefix + unicode(self.id)


class Dealer(BaseUser, db.Model):
    __tablename__ = 'dealers'
    # 法人真实姓名
    legal_person_name = db.Column(db.Unicode(10), nullable=False)
    # 法人身份证号码
    legal_person_identity = db.Column(db.CHAR(18), nullable=False)
    # 商家名称
    name = db.Column(db.Unicode(30), unique=True, nullable=False)
    # 营业执照注册号
    license_identity = db.Column(db.String(20), nullable=False)
    # 营业执照所在地
    license_address = db.Column(db.Unicode(30), nullable=False)
    # 营业执照期限
    license_limit = db.Column(db.Integer, nullable=False)
    # 长期印业执照
    license_long_time_limit = db.Column(db.Boolean, default=False, nullable=False)
    # 营业执照副本扫描件
    license_image = db.Column(db.String(255), nullable=False)
    # 地址 id
    address_id = db.Column(db.Integer, nullable=False)
    # 联系手机
    contact_mobile = db.Column(db.CHAR(11), nullable=False)
    # 联系电话
    contact_telephone = db.Column(db.CHAR(15), nullable=False)

    def __init__(self, password, mobile, email):
        super(Dealer, self).__init__(password, mobile, email)

    def get_id(self):
        return dealer_id_prefix + unicode(self.id)


class ProducerAuthorization(db.Model):
    __tablename__ = 'producer_authorizations'
    # id
    id = db.Column(db.Integer, primary_key=True)
    # 商家id
    dealer_id = db.Column(db.Integer, nullable=False)
    # 厂家id
    producer_id = db.Column(db.Integer, nullable=False)
    # 授权时间
    created = db.Column(db.Integer, default=time.time, nullable=False)
    # 确认授权
    confirmed = db.Column(db.Boolean, default=False, nullable=False)


class Goods(db.Model):
    # TODO: 单个商品多个分类，多种材料?
    __tablename__ = 'goods'
    # 商品id
    id = db.Column(db.Integer, primary_key=True)
    # 厂家id
    producer_id = db.Column(db.Integer, nullable=False)
    # 商品名称
    goods = db.Column(db.Unicode(20), nullable=False)


class GoodsCategory(db.Model):
    __tablename__ = 'goods_categories'
    id = db.Column(db.Integer, primary_key=True)
    goods_id = db.Column(db.Integer, nullable=False)
    category_id = db.Column(db.Integer, nullable=False)


class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.Unicode(10), nullable=False)


class Material(db.Model):
    __tablename__ = 'materials'
    id = db.Column(db.Integer, primary_key=True)
    material = db.Column(db.Unicode(10), nullable=False)


class GoodsAuthorization(db.Model):
    __tablename__ = 'goods_authorizations'
    id = db.Column(db.Integer, primary_key=True)
    goods_id = db.Column(db.Integer, nullable=False)
    created = db.Column(db.Integer, default=time.time, nullable=False)
    dealer_id = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Integer, nullable=False)


class Privilege(BaseUser, db.Model):
    __tablename__ = 'privileges'
    # 用户名
    username = db.Column(db.String(12), nullable=False, unique=True)

    def __init__(self, password, mobile, email):
        super(Privilege, self).__init__(password, mobile, email)

    def get_id(self):
        return admin_id_prefix + unicode(self.id)


class Province(db.Model):
    __tablename__ = 'provinces'
    id = db.Column(db.Integer, primary_key=True)
    province = db.Column(db.Unicode(10), nullable=False)


class City(db.Model):
    __tablename__ = 'cities'
    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.Unicode(10), nullable=False)
    province_id = db.Column(db.Integer, nullable=False)


class District(db.Model):
    __tablename__ = 'districts'
    id = db.Column(db.Integer, primary_key=True)
    district = db.Column(db.Unicode(10), nullable=False)
    city_id = db.Column(db.Integer, nullable=False)


class UserAddress(db.Model):
    __tablename__ = 'user_addresses'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    province_id = db.Column(db.Integer, nullable=False)
    city_id = db.Column(db.Integer, nullable=False)
    district_id = db.Column(db.Integer, nullable=False)
    created = db.Column(db.Integer, default=time.time, nullable=False)
    address = db.Column(db.Unicode(30), nullable=False)
    mobile = db.Column(db.CHAR(11), unique=True, nullable=False)


class ProducerAddress(db.Model):
    __tablename__ = 'producer_addresses'
    id = db.Column(db.Integer, primary_key=True)
    producer_id = db.Column(db.Integer, nullable=False)
    province_id = db.Column(db.Integer, nullable=False)
    city_id = db.Column(db.Integer, nullable=False)
    district_id = db.Column(db.Integer, nullable=False)
    address = db.Column(db.Unicode(30), nullable=False)
    created = db.Column(db.Integer, default=time.time, nullable=False)


class DealerAddress(db.Model):
    __tablename__ = 'dealer_addresses'
    id = db.Column(db.Integer, primary_key=True)
    dealer_id = db.Column(db.Integer, nullable=False)
    province_id = db.Column(db.Integer, nullable=False)
    city_id = db.Column(db.Integer, nullable=False)
    district_id = db.Column(db.Integer, nullable=False)
    address = db.Column(db.Unicode(30), nullable=False)
    created = db.Column(db.Integer, default=time.time, nullable=False)


@login_manager.user_loader
def load_user(user_id):
    id_ = int(user_id[1:])
    if user_id.starswith(admin_id_prefix):
        return Privilege.query.get(id_)
    elif user_id.starswith(producer_id_prefix):
        return Producer.query.get(id_)
    elif user_id.starswith(dealer_id_prefix):
        return Dealer.query.get(id_)
    return User.query.get(id_)