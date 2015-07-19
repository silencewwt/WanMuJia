# -*- coding: utf-8 -*-
from flask.ext.login import current_user
from flask.ext.wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, PasswordField, IntegerField, SelectMultipleField, TextAreaField
from wtforms.validators import ValidationError, DataRequired, Length, EqualTo, NumberRange

from app import db
from app.models import Vendor, VendorAddress, Material, SecondCategory, Stove, Carve, Sand, Paint, Decoration, \
    Tenon, Item, ItemTenon, ItemImage, Distributor, DistributorRevocation, FirstScene, SecondScene, FirstCategory
from app.utils.forms import Form
from app.utils.image import save_image
from app.utils.fields import OptionGroupSelectField, SelectField
from app.utils.validator import Email, Mobile, QueryID, Image, DistrictValidator


class LoginForm(Form):
    mobile = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired()])


class RegistrationForm(Form):
    email = StringField(validators=[Email()])   # TODO: exist email
    agent_name = StringField(validators=[DataRequired(u'必填')])
    agent_identity = StringField(validators=[DataRequired(u'必填'), Length(18, 18, u'身份证号码不符合规范!')])
    agent_identity_front = FileField(validators=[
        Image(required=True, base64=True), FileRequired(u'必填'), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])
    agent_identity_back = FileField(validators=[
        Image(required=True, base64=True), FileRequired(u'必填'), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])
    name = StringField(validators=[DataRequired(u'必填'), Length(2, 30, u'品牌厂商名称不符合规范')])
    license_limit = StringField(validators=[Length(8, 8)])
    license_image = FileField(validators=[
        Image(required=True, base64=True), FileRequired(u'必填'), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])
    telephone = StringField(validators=[DataRequired(u'必填'), Length(7, 15)])
    address = StringField(validators=[DistrictValidator(), Length(1, 30)])
    district_cn_id = StringField(validators=[DataRequired(), Length(6, 6)])
    logo = FileField(validators=[Image(required=True, base64=True), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])

    image_fields = ('agent_identity_front', 'agent_identity_back', 'license_image', 'logo')

    def save_images(self, vendor=None):
        vendor = vendor if vendor else current_user
        for image_field in self.image_fields:
            if getattr(self, image_field).data:
                image = save_image(vendor.id, 'vendor', getattr(self, image_field))
                setattr(vendor, image_field, image)
                db.session.add(vendor)
            db.session.commit()


class RegistrationDetailForm(RegistrationForm):
    password = PasswordField(validators=[DataRequired(), Length(6, 32), EqualTo('confirm_password')])
    confirm_password = PasswordField(validators=[DataRequired(), Length(6, 32)])

    def save_address(self, vendor):
        address = VendorAddress(vendor_id=vendor.id, cn_id=self.district_cn_id.data, address=self.address.data)
        db.session.add(address)
        db.session.commit()

    def add_vendor(self, mobile):
        vendor = Vendor(
            password=self.password.data,
            email=self.password.data,
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


class ReconfirmForm(RegistrationForm):
    agent_identity_front = FileField(validators=[
        Image(required=False), FileRequired(u'必填'), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])
    agent_identity_back = FileField(validators=[
        Image(required=False), FileRequired(u'必填'), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])
    license_image = FileField(validators=[
        Image(required=False), FileRequired(u'必填'), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])
    logo = FileField(validators=[Image(required=False), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])

    attributes = ('agent_name', 'agent_identity', 'name', 'license_limit', 'telephone')

    def update_address(self):
        current_user.address.address = self.address.data
        current_user.address.cn_id = self.district_cn_id.data
        db.session.add(current_user.address)
        db.session.commit()

    def show_info(self):
        for attr in self.attributes:
            getattr(self, attr).data = getattr(current_user, attr)
        self.email.data = current_user.email
        self.address.data = current_user.address.address
        self.district_cn_id.data = current_user.address.cn_id

    def reconfirm(self):
        self.save_images()
        self.update_address()
        for attr in self.attributes:
            setattr(current_user, attr, getattr(self, attr).data)
        if current_user.email is not self.email.data:
            current_user.email = self.email.data
            current_user.email_confirmed = False
        db.session.add(current_user)
        db.session.commit()


class ItemForm(Form):
    item = StringField(validators=[DataRequired(), Length(1, 20)])
    length = IntegerField(validators=[DataRequired(), NumberRange(1)])
    width = IntegerField(validators=[DataRequired(), NumberRange(1)])
    height = IntegerField(validators=[DataRequired(), NumberRange(1)])
    price = IntegerField(validators=[DataRequired(), NumberRange(1)])
    material_id = SelectField(coerce=int, validators=[DataRequired(), QueryID(Material)])
    second_category_id = OptionGroupSelectField(coerce=int, validators=[QueryID(SecondCategory)])
    second_scene_id = OptionGroupSelectField(coerce=int, validators=[QueryID(SecondScene)])
    stove_id = SelectField(coerce=int, validators=[DataRequired(), QueryID(Stove)])
    carve_id = SelectField(coerce=int, validators=[DataRequired(), QueryID(Carve)])
    sand_id = SelectField(coerce=int, validators=[DataRequired(), QueryID(Sand)])
    paint_id = SelectField(coerce=int, validators=[DataRequired(), QueryID(Paint)])
    decoration_id = SelectField(coerce=int, validators=[DataRequired(), QueryID(Decoration)])
    tenon_id = SelectMultipleField(coerce=int, validators=[DataRequired(), QueryID(Tenon)])
    story = TextAreaField(validators=[Length(0, 5000)])

    attributes = ('item', 'length', 'width', 'height', 'price', 'material_id', 'second_category_id', 'second_scene_id',
                  'stove_id', 'carve_id', 'sand_id', 'decoration_id', 'paint_id', 'story')

    def generate_choices(self):
        self.second_scene_id.choices = []
        first_scenes = FirstScene.query.order_by(FirstScene.id)
        for first_scene in first_scenes:
            l = [(choice.id, choice.second_scene) for choice in
                 SecondScene.query.filter_by(first_scene_id=first_scene.id)]
            self.second_scene_id.choices.append((first_scene.first_scene, l))

        self.second_category_id.choices = []
        first_categories = FirstCategory.query.order_by(FirstCategory.id)
        for first_category in first_categories:
            l = [(choice.id, choice.second_category) for choice in
                 SecondCategory.query.filter_by(first_category_id=first_category.id)]
            self.second_category_id.choices.append((first_category.first_category, l))

        self.material_id.choices = [(choice.id, choice.material) for choice in Material.query.all()]
        self.stove_id.choices = [(choice.id, choice.stove) for choice in Stove.query.all()]
        self.carve_id.choices = [(choice.id, choice.carve) for choice in Carve.query.all()]
        self.sand_id.choices = [(choice.id, choice.sand) for choice in Sand.query.all()]
        self.paint_id.choices = [(choice.id, choice.paint) for choice in Paint.query.all()]
        self.decoration_id.choices = [(choice.id, choice.decoration) for choice in Decoration.query.all()]
        self.tenon_id.choices = [(choice.id, choice.tenon) for choice in Tenon.query.all()]

    def add_item(self, vendor_id):
        item = Item(
            vendor_id=vendor_id,
            item=self.item.data,
            price=self.price.data,
            material_id=self.material_id.data,
            second_category_id=self.second_category_id.data,
            second_scene_id=self.second_scene_id.data,
            length=self.length.data,
            width=self.width.data,
            height=self.height.data,
            stove_id=self.stove_id.data,
            carve_id=self.carve_id.data,
            sand_id=self.sand_id.data,
            paint_id=self.paint_id.data,
            decoration_id=self.decoration_id.data,
            story=self.story.data
        )
        db.session.add(item)
        db.session.commit()
        for tenon_id in self.tenon_id.data:
            db.session.add(ItemTenon(item_id=item.id, tenon_id=tenon_id))
        db.session.commit()
        return item

    def show_item(self, item):
        for attr in self.attributes:
            getattr(self, attr).data = getattr(item, attr)
        self.tenon_id.data = item.get_tenon_id()

    def update_item(self, item):
        for attr in self.attributes:
            if not getattr(self, attr).data == getattr(item, attr):
                setattr(item, attr, getattr(self, attr).data)

        item_tenons = item.get_tenon_id()
        add_tenons = set(self.tenon_id.data) - set(item_tenons)
        del_tenons = set(item_tenons) - set(self.tenon_id.data)
        for tenon_id in add_tenons:
            db.session.add(ItemTenon(item_id=item.id, tenon_id=tenon_id))
        for tenon_id in del_tenons:
            db.session.delete(ItemTenon.query.filter_by(item_id=item.id, tenon_id=tenon_id).limit(1).first())
        db.session.add(item)
        db.session.commit()


class ItemImageForm(Form):
    item_id = IntegerField()
    image = FileField(validators=[Image(required=True), FileAllowed(['jpg', 'png'])])

    def validate_item_id(self, field):
        if field.data and field.data != current_user.id:
            raise ValidationError('wrong id')

    def add_item_image(self):
        image_path, image_hash = save_image(self.item_id.data, 'item', self.image)
        item_image = ItemImage(self.item_id.data, image_path, image_hash, 999)  # 新上传的图片默认在最后
        db.session.add(item_image)
        db.session.commit()
        return image_hash


class ItemImageSortForm(Form):
    item_id = IntegerField()
    images = StringField(validators=[])

    image_list = []

    def validate_item_id(self, field):
        if field.data and field.data != current_user.id:
            raise ValidationError('wrong id')

    def validate_images(self, field):
        image_list = []
        image_hashes = [image_hash.strip() for image_hash in field.data.split(',')]
        for image_hash in image_hashes:
            item_image = ItemImage.query.filter_by(image_hash=image_hash, item_id=self.item_id.data).limit(1).first()
            if not len(image_hash) == 32 or not item_image:
                raise ValidationError(u'图片hash值错误!')
            image_list.append(image_list)
        self.image_list = image_list

    def update_item_image_sort(self):
        for i in range(0, len(self.image_list)):
            self.image_list[i].sort = i
            db.session.add(self.image_list[i])
        db.session.commit()


class ItemImageDeleteForm(Form):
    image_hash = StringField(validators=[DataRequired(), Length(32, 32)])

    item_image = None

    def validate_image_hash(self, field):
        item_image = ItemImage.query.filter_by(image_hash=field.data, is_deleted=False).limit(1).first()
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
    logo = FileField(validators=[Image(required=False), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])
    telephone = StringField(validators=[DataRequired(u'电话号码必填'), Length(7, 15)])
    address = StringField(validators=[DataRequired(u'必填'), Length(1, 30)])
    introduction = StringField(validators=[])
    district_cn_id = StringField(validators=[DistrictValidator(), Length(6, 6)])

    def show_vendor_setting(self, vendor):
        self.telephone.data = vendor.telephone
        self.introduction.data = vendor.introduction
        self.district_cn_id.data = vendor.address.cn_id
        self.address.data = vendor.address.address

    def update_vendor_setting(self, vendor):
        vendor.introduction = self.introduction.data
        vendor.telephone = self.telephone.data
        vendor.address.address = self.address.data
        vendor.address.cn_id = self.district_cn_id.data
        if self.logo.data:
            logo = save_image(vendor.id, 'vendor', self.logo)
            vendor.logo = logo
        db.session.add(vendor)
        db.session.add(vendor.address)
        db.session.commit()


class RevocationForm(Form):
    image = FileField(validators=[Image(required=True)])
    distributor_id = IntegerField()

    distributor = None

    def validate_distributor_id(self, field):
        distributor = Distributor.query.get(field.data)
        if not distributor or distributor.vendor_id is not current_user.id:
            raise ValidationError()
        self.distributor = distributor

    def revoke(self):
        image = save_image(current_user.id, 'vendor', self.image)
        revocation = DistributorRevocation.query.filter_by(distributor_id=self.distributor.id).limit(1).first()
        if not revocation:
            revocation = DistributorRevocation(self.distributor.id, image)
        else:
            revocation.image = image
            revocation.pending = True
        db.session.add(revocation)
        db.session.commit()
