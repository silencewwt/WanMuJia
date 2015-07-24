# -*- coding: utf-8 -*-
from wtforms import StringField, PasswordField, IntegerField
from wtforms.validators import DataRequired, Length, EqualTo, NumberRange

from app import db
from app.forms import Form
from app.models import Distributor, DistributorAddress
from app.utils.validator import DistrictValidator


class LoginForm(Form):
    username = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired(), Length(32, 32)])


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


class StockForm(Form):
    items = StringField(validators=[DataRequired()])
    stock = IntegerField(validators=[DataRequired(), NumberRange(0)])
