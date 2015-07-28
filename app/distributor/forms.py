# -*- coding: utf-8 -*-
from flask import current_app
from flask.ext.login import login_user, current_user
from flask.ext.principal import identity_changed, Identity
from wtforms import StringField, PasswordField, IntegerField
from wtforms.validators import DataRequired, Length, EqualTo, NumberRange, ValidationError

from app import db
from app.forms import Form
from app.models import Distributor, DistributorAddress
from app.utils.validator import DistrictValidator


class LoginForm(Form):
    username = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired(), Length(32, 32)])

    def login(self):
        distributor = Distributor.query.filter_by(username=self.username.data).limit(1).first()
        if distributor and distributor.verify_password(self.password.data):
            login_user(distributor)
            identity_changed.send(current_app._get_current_object(), identity=Identity(distributor.get_id()))
            return True
        return False


class RegisterForm(Form):
    password = PasswordField(validators=[DataRequired(), Length(32, 32)])
    confirm_password = PasswordField(validators=[DataRequired(), Length(32, 32), EqualTo('confirm_password', u'前后密码不一致')])
    name = StringField(validators=[DataRequired(u'必填')])
    contact_mobile = StringField(validators=[DataRequired(u'必填')])
    contact_telephone = StringField(validators=[DataRequired(u'必填')])
    contact = StringField(validators=[DataRequired(u'必填')])
    address = StringField(validators=[DataRequired(u'必填')])
    district_cn_id = StringField(validators=[DistrictValidator()])

    def add_distributor(self, vendor_id):
        username = Distributor.generate_username()
        if username is False:
            return False
        distributor = Distributor(
            username=username,
            password=self.password.data,
            vendor_id=vendor_id,
            name=self.name.data,
            contact_mobile=self.contact_mobile.data,
            contact_telephone=self.contact_telephone.data,
            contact=self.contact.data
        )
        db.session.add(distributor)
        db.session.commit()
        distributor_address = DistributorAddress(
            distributor_id=distributor.id,
            cn_id=self.district_cn_id.data,
            address=self.address.data
        )
        db.session.add(distributor_address)
        db.session.commit()
        return distributor


class SettingsForm(Form):
    username = StringField()
    name = StringField()
    contact_telephone = StringField()
    contact_mobile = StringField()
    contact = StringField()
    district_cn_id = StringField(validators=[DistrictValidator(), Length(6, 6)])
    address = StringField(validators=[DataRequired(u'必填'), Length(1, 30)])

    attributes = ('username', 'name', 'contact_mobile', 'contact', 'contact_telephone')

    address_attributes = ('province', 'city', 'district')

    def show_address(self):
        grades_id = [_.cn_id for _ in current_user.address.area.grade()]
        while len(grades_id) < 3:
            grades_id.append(None)
        for attr, cn_id in zip(self.address_attributes, grades_id):
            setattr(self, attr, cn_id)

    def validate_contact_info(self, field):
        if not self.contact_mobile.data and not self.contact_telephone.data:
            raise ValidationError(u'联系人电话与手机至少填一项')

    def show_settings(self):
        for attr in self.attributes:
            getattr(self, attr).data = getattr(current_user, attr)
        self.address.data = current_user.address.address
        self.show_address()

    def update_settings(self):
        current_user.contact = self.contact.data
        current_user.contact_telephone = self.contact_telephone.data
        current_user.contact_mobile = self.contact_mobile.data
        current_user.address.address = self.address.data
        current_user.address.cn_id = self.district_cn_id.data
        db.session.add(current_user)
        db.session.add(current_user.address)
        db.session.commit()
