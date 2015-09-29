# -*- coding: utf-8 -*-
import datetime
from base64 import b64decode

from flask.ext.cdn import url_for
from flask.ext.login import current_user, current_app
from flask.ext.wtf.file import FileField
from wtforms import StringField, PasswordField, IntegerField, SelectMultipleField, TextAreaField, FloatField, HiddenField
from wtforms.validators import ValidationError, DataRequired, Length, EqualTo, NumberRange

from app import db
from app.constants import SMS_CAPTCHA, VENDOR_REMINDS_PENDING, VENDOR_REMINDS_COMPLETE
from app.models import Vendor, VendorAddress, Material, Stove, Carve, Sand, Paint, Decoration, \
    Tenon, Item, ItemTenon, ItemCarve, ItemImage, Distributor, DistributorRevocation, FirstScene, SecondScene, \
    FirstMaterial, SecondMaterial, Category
from app.sms import sms_generator, VENDOR_PENDING_TEMPLATE
from app.utils import IO
from app.utils.forms import Form
from app.utils.image import save_image
from app.utils.fields import OptionGroupSelectField, SelectField, SelectNotRequiredField
from app.utils.validator import Email, Mobile, Captcha, QueryID, Image, DistrictValidator, Digit


class LoginForm(Form):
    mobile = StringField(validators=[DataRequired(u'请填写手机或邮箱')])
    password = PasswordField(validators=[Length(6, 32, u'密码长度不正确')])


class RegistrationForm(Form):
    email = StringField(validators=[Email(message=u'邮箱不正确')])
    agent_name = StringField(validators=[Length(1, 10, u'代理人姓名不正确')])
    agent_identity = StringField(validators=[Length(18, 18, u'代理人身份证号码不正确')])
    agent_identity_front = FileField(validators=[Image(required=True, base64=True, message=u'身份证正面照片不正确')])
    agent_identity_back = FileField(validators=[Image(required=True, base64=True, message=u'身份证反面照片不正确')])
    license_image = FileField(validators=[Image(required=True, base64=True, message=u'营业执照照片不正确')])
    name = StringField(validators=[Length(2, 30, u'品牌厂商名称不正确')])
    license_limit = StringField(validators=[Length(8, 10, u'营业执照期限不正确')])
    telephone = StringField(validators=[Length(7, 15, u'固话不正确')])
    address = StringField(validators=[Length(1, 30, u'地址不正确')])
    district_cn_id = StringField(validators=[DistrictValidator(), Length(6, 6)])

    image_fields = ('agent_identity_front', 'agent_identity_back', 'license_image')

    def validate_license_limit(self, field):
        try:
            date = list(map(int, field.data.split('/')))
            limit = datetime.datetime(date[0], date[1], date[2])
        except ValueError:
            raise ValidationError(u'营业执照期限格式不正确')
        self.license_limit.data = limit.strftime('%G/%m/%d')

    def save_images(self, vendor=None):
        vendor = vendor if vendor else current_user
        for image_field in self.image_fields:
            if getattr(self, image_field).data:
                image, image_hash = save_image(vendor.id, 'vendor', getattr(self, image_field),
                                               IO(b64decode(getattr(self, image_field).data[23:])))
                setattr(vendor, image_field, image)
                db.session.add(vendor)
            db.session.commit()


class RegistrationDetailForm(RegistrationForm):
    password = PasswordField(validators=[Length(6, 32), EqualTo('confirm_password', u'确认密码不一致')])
    confirm_password = PasswordField(validators=[Length(6, 32)])

    def save_address(self, vendor):
        address = VendorAddress(vendor_id=vendor.id, cn_id=self.district_cn_id.data, address=self.address.data)
        db.session.add(address)
        db.session.commit()

    def add_vendor(self, mobile):
        vendor = Vendor(
            password=self.password.data,
            email=self.email.data,
            mobile=mobile,
            agent_name=self.agent_name.data,
            agent_identity=self.agent_identity.data,
            license_limit=self.license_limit.data,
            name=self.name.data,
            telephone=self.telephone.data,
        )
        db.session.add(vendor)
        db.session.commit()
        self.save_images(vendor=vendor)
        self.save_address(vendor=vendor)
        vendor.push_confirm_reminds('warning')  # 信息审核中
        sms_generator(VENDOR_PENDING_TEMPLATE, vendor.mobile)
        return vendor


class ReconfirmForm(RegistrationForm):
    email = None
    agent_identity_front = FileField(validators=[Image(required=False, base64=True, message=u'身份证正面照片不正确')])
    agent_identity_back = FileField(validators=[Image(required=False, base64=True, message=u'身份证反面照片不正确')])
    license_image = FileField(validators=[Image(required=False, base64=True, message=u'营业执照照片不正确')])

    is_reconfirm = True

    address_attributes = ('province', 'city', 'district')
    attributes = ('agent_name', 'agent_identity', 'name', 'license_limit', 'telephone')
    url_attributes = ('agent_identity_front', 'agent_identity_back', 'license_image', 'logo')

    def update_address(self):
        current_user.address.address = self.address.data
        current_user.address.cn_id = self.district_cn_id.data
        db.session.add(current_user.address)
        db.session.commit()

    def show_address(self):
        area = current_user.address.area
        if area:
            grades_id = [_.cn_id for _ in current_user.address.area.grade()]
        else:
            grades_id = []
        while len(grades_id) < 3:
            grades_id.append(None)
        for attr, cn_id in zip(self.address_attributes, grades_id):
            setattr(self, attr, cn_id)

    def show_info(self):
        for attr in self.attributes:
            getattr(self, attr).data = getattr(current_user, attr)
        for attr in self.url_attributes:
            setattr(self, attr + '_url', url_for('static', filename=getattr(current_user, attr)))
        self.address.data = current_user.address.address
        self.district_cn_id.data = current_user.address.cn_id
        self.show_address()

    def reconfirm(self):
        self.save_images()
        self.update_address()
        for attr in self.attributes:
            setattr(current_user, attr, getattr(self, attr).data)
        db.session.commit()
        current_user.flush('info_completed')
        if current_user.info_completed:
            current_user.push_confirm_reminds(VENDOR_REMINDS_PENDING)
        else:
            current_user.push_confirm_reminds(VENDOR_REMINDS_COMPLETE)


class ItemForm(Form):
    item = StringField(validators=[Length(1, 20, u'商品名称格式不正确')])
    length = StringField(validators=[Digit(required=False, min=0, message='商品长度不正确')])
    width = StringField(validators=[Digit(required=False, min=0, message='商品宽度不正确')])
    height = StringField(validators=[Digit(required=False, min=0, message='商品高度不正确')])
    area = StringField(validators=[Digit(required=False, min=0, message='商品适用面积不正确')])
    price = StringField(validators=[Digit(required=True, min=0, message='商品价格不正确')])
    second_material_id = OptionGroupSelectField(coerce=int, validators=[QueryID(SecondMaterial, u'商品材料不正确')])
    category_id = StringField(validators=[QueryID(Category, '商品种类不正确')])
    second_scene_id = OptionGroupSelectField(coerce=int, validators=[QueryID(SecondScene, u'商品场景不正确')])
    stove_id = SelectField(coerce=int, validators=[QueryID(Stove, u'烘干工艺不正确')])
    carve_id = SelectMultipleField(coerce=int, validators=[QueryID(Carve, u'雕刻工艺不正确')])
    outside_sand_id = SelectField(coerce=int, validators=[QueryID(model=Sand, required=True, message=u'内打磨砂纸不正确')])
    inside_sand_id = SelectNotRequiredField(coerce=int, validators=[QueryID(model=Sand, required=False, message=u'外打磨砂纸不正确')])
    paint_id = SelectField(coerce=int, validators=[QueryID(Paint, u'涂饰工艺不正确')])
    decoration_id = SelectField(coerce=int, validators=[QueryID(Decoration, u'装饰工艺不正确')])
    tenon_id = SelectMultipleField(coerce=int, validators=[QueryID(Tenon, u'榫卯结构不正确')])
    story = TextAreaField(validators=[Length(0, 5000)])

    attributes = ('item', 'length', 'width', 'height', 'price', 'area', 'second_material_id', 'category_id',
                  'second_scene_id', 'stove_id', 'outside_sand_id', 'decoration_id', 'paint_id', 'story')

    def validate_area(self, field):
        if not (field.data or (self.length.data and self.width.data and self.height.data)):
            raise ValidationError(u'适用面积与长宽高至少需填一项')

    def generate_choices(self):
        self.second_scene_id.choices = []
        first_scenes = FirstScene.query.order_by(FirstScene.id)
        for first_scene in first_scenes:
            l = [(choice.id, choice.second_scene) for choice in
                 SecondScene.query.filter_by(first_scene_id=first_scene.id)]
            self.second_scene_id.choices.append((first_scene.first_scene, l))

        self.second_material_id.choices = []
        first_materials = FirstMaterial.query.order_by(FirstMaterial.id)
        for first_material in first_materials:
            l = [(choice.id, choice.second_material) for choice in
                 SecondMaterial.query.filter_by(first_material_id=first_material.id)]
            self.second_material_id.choices.append((first_material.first_material, l))

        self.stove_id.choices = [(choice.id, choice.stove) for choice in Stove.query.all()]
        self.carve_id.choices = [(choice.id, choice.carve) for choice in Carve.query.all()]
        self.outside_sand_id.choices = [(choice.id, choice.sand) for choice in Sand.query.all()]
        self.inside_sand_id.choices = [(choice.id, choice.sand) for choice in Sand.query.all()]
        self.paint_id.choices = [(choice.id, choice.paint) for choice in Paint.query.all()]
        self.decoration_id.choices = [(choice.id, choice.decoration) for choice in Decoration.query.all()]
        self.tenon_id.choices = [(choice.id, choice.tenon) for choice in Tenon.query.all()]

    def add_item(self, vendor_id):
        item = Item(
            vendor_id=vendor_id,
            item=self.item.data,
            price=self.price.data,
            second_material_id=self.second_material_id.data,
            category_id=self.category_id.data,
            second_scene_id=self.second_scene_id.data,
            length=self.length.data,
            width=self.width.data,
            height=self.height.data,
            area=self.area.data,
            stove_id=self.stove_id.data,
            outside_sand_id=self.outside_sand_id.data,
            inside_sand_id=self.inside_sand_id.data if self.inside_sand_id.data else 0,
            paint_id=self.paint_id.data,
            decoration_id=self.decoration_id.data,
            story=self.story.data,
            suite_id=0,
            amount=1,
            is_suite=False,
            is_component=False
        )
        db.session.add(item)
        db.session.commit()
        self.add_attach(item.id)
        return item

    def add_attach(self, item_id):
        for carve_id in self.carve_id.data:
            db.session.add(ItemCarve(item_id=item_id, carve_id=carve_id))
        for tenon_id in self.tenon_id.data:
            db.session.add(ItemTenon(item_id=item_id, tenon_id=tenon_id))
        db.session.commit()

    def show_category(self, item):
        attrs = ('first_category_id', 'second_category_id', 'third_category_id')
        categories_id = []
        category = Category.query.get(item.category_id)
        while category is not None:
            categories_id.append(category.id)
            category = Category.query.get(category.father_id)
        categories_id.reverse()
        if len(categories_id) < 3:
            categories_id.append('')
        for attr, category_id in zip(attrs, categories_id):
            setattr(self, attr, category_id)

    def show_item(self, item):
        for attr in self.attributes:
            getattr(self, attr).data = getattr(item, attr)
        self.tenon_id.data = item.get_tenon_id()
        self.carve_id.data = item.get_carve_id()
        if self.inside_sand_id is not 0:
            self.inside_sand_id.data = item.inside_sand_id
        self.show_category(item)

    def update_item(self, item):
        for attr in self.attributes:
            if not getattr(self, attr).data == getattr(item, attr):
                setattr(item, attr, getattr(self, attr).data)

        item_tenons = item.get_tenon_id()
        add_tenons = set(self.tenon_id.data) - set(item_tenons)
        del_tenons = set(item_tenons) - set(self.tenon_id.data)
        item_carves = item.get_carve_id()
        add_carves = set(self.carve_id.data) - set(item_carves)
        del_carves = set(item_carves) - set(self.carve_id.data)
        for tenon_id in add_tenons:
            db.session.add(ItemTenon(item_id=item.id, tenon_id=tenon_id))
        for tenon_id in del_tenons:
            db.session.delete(ItemTenon.query.filter_by(item_id=item.id, tenon_id=tenon_id).limit(1).first())
        for carve_id in add_carves:
            db.session.add(ItemCarve(item_id=item.id, carve_id=carve_id))
        for carve_id in del_carves:
            db.session.delete(ItemCarve.query.filter_by(item_id=item.id, carve_id=carve_id).limit(1).first())
        db.session.add(item)
        db.session.commit()


class ComponentForm(Form):
    component_id = HiddenField()
    component = StringField(validators=[Length(1, 20, u'商品名称格式不正确')])
    length = StringField(validators=[Digit(required=False, min=0, message='商品长度不正确')])
    width = StringField(validators=[Digit(required=False, min=0, message='商品宽度不正确')])
    height = StringField(validators=[Digit(required=False, min=0, message='商品高度不正确')])
    area = StringField(validators=[Digit(required=False, min=0, message='商品适用面积不正确')])
    category_id = StringField(validators=[QueryID(Category, message='商品种类不正确')])
    carve_id = SelectMultipleField(coerce=int, validators=[QueryID(Carve, u'雕刻工艺不正确')])
    paint_id = SelectField(coerce=int, validators=[QueryID(Paint, u'涂饰工艺不正确')])
    decoration_id = SelectField(coerce=int, validators=[QueryID(Decoration, u'装饰工艺不正确')])
    tenon_id = SelectMultipleField(coerce=int, validators=[QueryID(Tenon, u'榫卯结构不正确')])
    amount = IntegerField(validators=[Digit(required=True, min=1, message='商品数量不正确')])

    attributes = ('length', 'width', 'height', 'price', 'category_id', 'decoration_id', 'paint_id')

    def __init__(self, suite_id=None, *args, **kwargs):
        self.suite_id = suite_id
        super(ComponentForm, self).__init__(*args, **kwargs)

    def validate_area(self, field):
        if not (field.data or (self.length.data and self.width.data and self.height.data)):
            raise ValidationError(u'适用面积与长宽高至少需填一项')

    def validate_component_id(self, field):
        if field.data and self.suite_id is not None:
            component = Item.query.get(field.data)
            if component is None or component.is_deleted or component.suite_id != self.suite_id:
                raise ValidationError('组件id错误')
            self.component = component

    def generate_choices(self):
        self.carve_id.choices = [(choice.id, choice.carve) for choice in Carve.query.all()]
        self.paint_id.choices = [(choice.id, choice.paint) for choice in Paint.query.all()]
        self.decoration_id.choices = [(choice.id, choice.decoration) for choice in Decoration.query.all()]
        self.tenon_id.choices = [(choice.id, choice.tenon) for choice in Tenon.query.all()]

    def add_component(self, vendor_id, suite_id):
        component = Item(
            vendor_id=vendor_id,
            item=self.component.data,
            price=0,
            second_material_id=0,
            category_id=self.category_id.data,
            second_scene_id=0,
            length=self.length.data,
            width=self.width.data,
            height=self.height.data,
            area=self.area.data,
            stove_id=0,
            outside_sand_id=0,
            inside_sand_id=0,
            paint_id=self.paint_id.data,
            decoration_id=self.decoration_id.data,
            story='',
            suite_id=suite_id,
            amount=self.amount.data,
            is_suite=False,
            is_component=True
        )
        db.session.add(component)
        db.session.commit()
        self.add_attach(component.id)
        return component

    def add_attach(self, item_id):
        for carve_id in self.carve_id.data:
            db.session.add(ItemCarve(item_id=item_id, carve_id=carve_id))
        for tenon_id in self.tenon_id.data:
            db.session.add(ItemTenon(item_id=item_id, tenon_id=tenon_id))
        db.session.commit()

    def show_category(self, component):
        attrs = ('first_category_id', 'second_category_id', 'third_category_id')
        categories_id = []
        category = Category.query.get(component.category_id)
        while category is not None:
            categories_id.append(category.id)
            category = Category.query.get(category.father_id)
        categories_id.reverse()
        if len(categories_id) < 3:
            categories_id.append('')
        for attr, category_id in zip(attrs, categories_id):
            setattr(self, attr, category_id)

    def show_component(self, component):
        for attr in ('amount', 'category_id', 'decoration_id', 'paint_id', 'length', 'width', 'height', 'area'):
            getattr(self, attr).data = getattr(component, attr)
        self.component.data = component.item
        self.component_id.data = component.id
        self.tenon_id.data = component.get_tenon_id()
        self.carve_id.data = component.get_carve_id()

        self.show_category(component)

    def update_component(self, component):
        component.item = self.component.data
        component.amount = self.amount.data
        for attr in self.attributes:
            if not getattr(self, attr).data == getattr(component, attr):
                setattr(component, attr, getattr(self, attr).data)

        component_tenons = component.get_tenon_id()
        add_tenons = set(self.tenon_id.data) - set(component_tenons)
        del_tenons = set(component_tenons) - set(self.tenon_id.data)
        component_carves = component.get_carve_id()
        add_carves = set(self.carve_id.data) - set(component_carves)
        del_carves = set(component_carves) - set(self.carve_id.data)
        for tenon_id in add_tenons:
            db.session.add(ItemTenon(item_id=component.id, tenon_id=tenon_id))
        for tenon_id in del_tenons:
            db.session.delete(ItemTenon.query.filter_by(item_id=component.id, tenon_id=tenon_id).limit(1).first())
        for carve_id in add_carves:
            db.session.add(ItemCarve(item_id=component.id, carve_id=carve_id))
        for carve_id in del_carves:
            db.session.delete(ItemCarve.query.filter_by(item_id=component.id, carve_id=carve_id).limit(1).first())
        db.session.add(component)
        db.session.commit()

    def update(self, component=None):
        if component is not None:
            self.update_component(component)
        elif self.component is not None:
            self.update_component(self.component)


class SuiteForm(Form):
    item = StringField(validators=[Length(1, 20, u'商品名称格式不正确')])
    area = StringField(validators=[Digit(required=True, min=0, message='商品适用面积不正确')])
    price = StringField(validators=[Digit(required=True, min=0, message='商品适用面积不正确')])
    second_material_id = OptionGroupSelectField(coerce=int, validators=[QueryID(SecondMaterial, u'商品材料不正确')])
    second_scene_id = OptionGroupSelectField(coerce=int, validators=[QueryID(SecondScene, u'商品场景不正确')])
    stove_id = SelectField(coerce=int, validators=[QueryID(Stove, u'烘干工艺不正确')])
    outside_sand_id = SelectField(coerce=int, validators=[QueryID(model=Sand, required=True, message=u'外打磨砂纸不正确')])
    inside_sand_id = SelectNotRequiredField(coerce=int, validators=[QueryID(model=Sand, required=False, message=u'内打磨砂纸不正确')])
    story = TextAreaField(validators=[Length(0, 5000)])

    attributes = ('item', 'area', 'price', 'second_material_id', 'second_scene_id', 'stove_id', 'outside_sand_id',
                  'story')

    def generate_choices(self):
        self.second_scene_id.choices = []
        first_scenes = FirstScene.query.order_by(FirstScene.id)
        for first_scene in first_scenes:
            l = [(choice.id, choice.second_scene) for choice in
                 SecondScene.query.filter_by(first_scene_id=first_scene.id)]
            self.second_scene_id.choices.append((first_scene.first_scene, l))

        self.second_material_id.choices = []
        first_materials = FirstMaterial.query.order_by(FirstMaterial.id)
        for first_material in first_materials:
            l = [(choice.id, choice.second_material) for choice in
                 SecondMaterial.query.filter_by(first_material_id=first_material.id)]
            self.second_material_id.choices.append((first_material.first_material, l))

        self.stove_id.choices = [(choice.id, choice.stove) for choice in Stove.query.all()]
        self.outside_sand_id.choices = [(choice.id, choice.sand) for choice in Sand.query.all()]
        self.inside_sand_id.choices = [(choice.id, choice.sand) for choice in Sand.query.all()]

    def add_suite(self, vendor_id):
        suite = Item(
            vendor_id=vendor_id,
            item=self.item.data,
            price=self.price.data,
            second_material_id=self.second_material_id.data,
            category_id=0,
            second_scene_id=self.second_scene_id.data,
            length=0,
            width=0,
            height=0,
            area=self.area.data,
            stove_id=self.stove_id.data,
            outside_sand_id=self.outside_sand_id.data,
            inside_sand_id=self.inside_sand_id.data,
            paint_id=0,
            decoration_id=0,
            story=self.story.data,
            suite_id=0,
            amount=1,
            is_suite=True,
            is_component=False
        )
        db.session.add(suite)
        db.session.commit()
        return suite

    def show_suite(self, suite):
        for attr in self.attributes:
            getattr(self, attr).data = getattr(suite, attr)
        if self.inside_sand_id is not 0:
            self.inside_sand_id.data = suite.inside_sand_id

    def update_suite(self, suite):
        for attr in self.attributes:
            setattr(suite, attr, getattr(self, attr).data)
        suite.inside_sand_id = self.inside_sand_id.data
        suite.update_suite_amount()


class ItemImageForm(Form):
    item_id = IntegerField()
    file = FileField(validators=[Image(required=True, message=u'商品图片不正确')])

    def validate_item_id(self, field):
        if field.data:
            item = Item.query.get(field.data)
            if not item or item.vendor_id != current_user.id:
                raise ValidationError('wrong id')
        else:
            raise ValidationError('wrong id')

    def add_item_image(self):
        image_path, image_hash = save_image(self.item_id.data, 'item', self.file, self.file.data.stream)
        item_image = ItemImage(self.item_id.data, image_path, image_hash, self.file.data.filename[:30], 999)  # 新上传的图片默认在最后
        db.session.add(item_image)
        db.session.commit()
        return {'hash': item_image.hash, 'url': item_image.url, 'created': item_image.created}


class ItemImageSortForm(Form):
    item_id = IntegerField()
    images = StringField()

    image_list = []

    def validate_item_id(self, field):
        if field.data:
            item = Item.query.get(field.data)
            if not item or item.vendor_id != current_user.id:
                raise ValidationError('wrong id')
        else:
            raise ValidationError('wrong id')

    def validate_images(self, field):
        image_list = []
        image_hashes = [image_hash.strip() for image_hash in field.data.split(',')]
        for image_hash in image_hashes:
            item_image = ItemImage.query.filter_by(hash=image_hash, item_id=self.item_id.data).limit(1).first()
            if not len(image_hash) == 32 or not item_image:
                raise ValidationError(u'图片hash值错误!')
            image_list.append(item_image)
        self.image_list = image_list

    def update_item_image_sort(self):
        for i in range(0, len(self.image_list)):
            self.image_list[i].sort = i
            db.session.add(self.image_list[i])
        db.session.commit()


class ItemImageDeleteForm(Form):
    image_hash = StringField()

    item_image = None

    def validate_image_hash(self, field):
        item_image = ItemImage.query.filter_by(hash=field.data, is_deleted=False).limit(1).first()
        if not item_image:
            raise ValidationError()
        if not item_image.get_vendor_id() == current_user.id:
            raise ValidationError()
        self.item_image = item_image

    def delete_image(self):
        self.item_image.is_deleted = True
        db.session.add(self.item_image)
        db.session.commit()


class SettingsForm(Form):
    name = StringField()
    logo = FileField(validators=[Image(required=False, message=u'logo不正确')])
    mobile = StringField()
    telephone = StringField(validators=[Length(7, 15, u'电话号码不正确')])
    contact = StringField()
    address = StringField(validators=[Length(1, 30, u'地址不正确')])
    introduction = StringField(validators=[Length(0, 30, u'厂家简介不正确')])
    district_cn_id = StringField(validators=[DistrictValidator(), Length(6, 6)])
    email = StringField()

    logo_url = None

    address_attributes = ('province', 'city', 'district')

    def __init__(self, vendor, *args, **kwargs):
        super(SettingsForm, self).__init__(*args, **kwargs)
        self.email.validators = [Email(model=Vendor, exist_owner=vendor)]

    def show_address(self):
        grades_id = [_.cn_id for _ in current_user.address.area.grade()]
        while len(grades_id) < 3:
            grades_id.append(None)
        for attr, cn_id in zip(self.address_attributes, grades_id):
            setattr(self, attr, cn_id)

    def show_vendor_setting(self, vendor):
        self.telephone.data = vendor.telephone
        self.introduction.data = vendor.introduction
        self.district_cn_id.data = vendor.address.cn_id
        self.name.data = vendor.name
        self.contact.data = vendor.contact
        self.address.data = vendor.address.address
        self.mobile.data = vendor.mobile
        self.logo_url = url_for('static', filename=vendor.logo)
        self.show_address()
        self.email.data = vendor.email

    def update_vendor_setting(self, vendor):
        vendor.introduction = self.introduction.data
        vendor.telephone = self.telephone.data
        vendor.contact = self.contact.data
        vendor.address.address = self.address.data
        vendor.address.cn_id = self.district_cn_id.data
        if vendor.email != self.email.data:
            vendor.email = self.email.data
            vendor.email_confirmed = False
        if self.logo.data:
            logo, image_hash = save_image(vendor.id, 'vendor', self.logo, self.logo.data.stream)
            vendor.logo = logo
        db.session.add(vendor)
        db.session.add(vendor.address)
        db.session.commit()


class RevocationForm(Form):
    contract = FileField(validators=[Image(required=True)])
    distributor_id = IntegerField()

    distributor = None

    def validate_distributor_id(self, field):
        if field.data is None:
            raise ValidationError('无此商家')
        distributor = Distributor.query.get(field.data)
        if not distributor or distributor.vendor_id is not current_user.id:
            raise ValidationError()
        self.distributor = distributor

    def revoke(self):
        contract, image_hash = save_image(current_user.id, 'vendor', self.contract, self.contract.data.stream)
        revocation = DistributorRevocation.query.filter_by(distributor_id=self.distributor.id).limit(1).first()
        if not revocation:
            revocation = DistributorRevocation(self.distributor.id, contract)
        else:
            revocation.contract = contract
            revocation.pending = True
        db.session.add(revocation)
        db.session.commit()


class InitializationForm(Form):
    captcha = StringField(validators=[Captcha(SMS_CAPTCHA, 'mobile')])
    mobile = StringField(validators=[Mobile()])
    password = PasswordField(validators=[Length(32, 32)])
    name = StringField(validators=[Length(2, 30, u'品牌厂商名称不正确')])

    def initial(self):
        current_user.mobile = self.mobile.data
        current_user.password = self.password.data
        current_user.name = self.name.data
        current_user.initialized = True
        db.session.commit()
