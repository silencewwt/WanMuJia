# -*- coding: utf-8 -*-
from flask.ext.wtf import Form
from wtforms import StringField, PasswordField, IntegerField
from wtforms.validators import DataRequired, Length, EqualTo, NumberRange

from app import db
from app.models import Distributor, DistributorAddress


class LoginForm(Form):
    username = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired(), Length(6, 32)])


class RegisterForm(Form):
    password = PasswordField(validators=[DataRequired(), Length(6, 32)])
    confirm_password = PasswordField(validators=[DataRequired(), Length(6, 32), EqualTo('confirm_password', u'前后密码不一致')])
    legal_person_name = StringField(validators=[DataRequired(u'必填')])
    legal_person_identity = StringField(validators=[DataRequired(u'必填'), Length(18, 18)])
    name = StringField(validators=[DataRequired(u'必填')])
    contact_mobile = StringField(validators=[DataRequired(u'必填')])
    contact_telephone = StringField(validators=[DataRequired(u'必填')])
    contact = StringField(validators=[DataRequired(u'必填')])
    address = StringField(validators=[DataRequired(u'必填')])
    address_id = StringField(validators=[DataRequired(u'必填')])

    def add_distributor(self, vendor_id):
        distributor = Distributor(
            password=self.password.data,
            vendor_id=vendor_id,
            legal_person_name=self.legal_person_name.data,
            legal_person_identity=self.legal_person_identity.data,
            name=self.name.data,
            address_id=0,
            contact_mobile=self.contact_mobile.data,
            contact_telephone=self.contact_telephone.data,
            contact=self.contact.data
        )
        db.session.add(distributor)
        db.session.commit()
        distributor_address = DistributorAddress(
            distributor_id=distributor.id,
            district_id=self.address_id.data,
            address=self.address.data
        )
        db.session.add(distributor_address)
        db.session.commit()
        distributor.address_id = distributor_address.id
        return distributor


class StockForm(Form):
    items = StringField(validators=[DataRequired()])
    stock = IntegerField(validators=[DataRequired(), NumberRange(0)])
