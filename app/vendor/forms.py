# -*- coding: utf-8 -*-
from cStringIO import StringIO
from PIL import Image
from flask.ext.wtf import Form
from flask.ext.wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import ValidationError, DataRequired, Length, EqualTo

from app import db
from app.models import Vendor, District, VendorAddress
from app.utils import save_image
from app.utils.validator import Email, Mobile


class LoginForm(Form):
    mobile = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired()])


class RegistrationDetailForm(Form):
    email = StringField(validators=[Email()])
    password = PasswordField(validators=[DataRequired(), Length(6, 32), EqualTo('confirm_password')])
    confirm_password = PasswordField(validators=[DataRequired(), Length(6, 32)])
    legal_person_name = StringField(validators=[DataRequired(u'必填')])
    legal_person_identity = StringField(validators=[DataRequired(u'必填'), Length(18, 18, u'身份证号码不符合规范!')])
    legal_person_identity_front = FileField(validators=[
        FileRequired(u'必填'), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])
    legal_person_identity_back = FileField(validators=[
        FileRequired(u'必填'), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])
    name = StringField(validators=[DataRequired(u'必填'), Length(2, 30, u'品牌厂商名称不符合规范')])
    license_address = StringField(validators=[DataRequired(u'必填')])
    license_limit = StringField(validators=[Length(8, 8)])
    license_long_time_limit = BooleanField()
    license_image = FileField(validators=[FileRequired(u'必填'), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])
    contact_mobile = StringField(validators=[DataRequired(u'必填'), Mobile(available=False)])
    contact_telephone = StringField(validators=[DataRequired(u'必填'), Length(7, 15)])
    address = StringField(validators=[DataRequired(u'必填'), Length(1, 30)])
    address_id = StringField(validators=[DataRequired(), Length(6, 6)])

    # TODO: add address select

    def validate_license_limit(self, field):
        if not field.data and not self.license_long_time_limit.data:
            raise ValidationError(u'请填写营业执照期限或选择长期营业执照')

    def validate_legal_person_identity_front(self, field):
        try:
            im = Image.open(StringIO(field.data))
            im.verify()
        except:
            raise ValidationError(u'图片格式错误')

    def validate_legal_person_identity_back(self, field):
        try:
            im = Image.open(StringIO(field.data))
            im.verify()
        except:
            raise ValidationError(u'图片格式错误')

    def validate_license_image(self, field):
        try:
            im = Image.open(StringIO(field.data))
            im.verify()
        except:
            raise ValidationError(u'图片格式错误')

    def add_vendor(self, mobile):
        district = District.query.filter_by(cn_id=self.address_id)
        address = VendorAddress(vendor_id='', district_id=district.id, address=self.address.data)
        db.session.add(address)
        db.session.commit()
        vendor = Vendor(
            password=self.password.data,
            email=self.password.data,
            mobile=mobile,
            legal_person_name=self.legal_person_name.data,
            legal_person_identity=self.legal_person_identity.data,
            license_address=self.license_address.data,
            license_limit=self.license_limit.data,
            license_long_time_limit=self.license_long_time_limit.data,
            name=self.name.data,
            contact_mobile=self.contact_mobile.data,
            contact_telephone=self.contact_telephone.data,
            address_id=address.id
        )
        db.session.add(vendor)
        db.session.commit()
        identity_front = save_image(vendor.id, self.legal_person_identity_front)
        identity_back = save_image(vendor.id, self.legal_person_identity_back)
        license_image = save_image(vendor.id, self.license_image)
        vendor.legal_person_identity_front = identity_front
        vendor.legal_person_identity_back = identity_back
        vendor.license_image = license_image


class ItemForm(Form):
    pass