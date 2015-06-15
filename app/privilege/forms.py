# -*- coding: utf-8 -*-
from flask_security import current_user
from flask.ext.wtf import Form
from wtforms import StringField, PasswordField, IntegerField
from wtforms.validators import ValidationError, DataRequired, Length

from app import db
from app.models import Vendor


class LoginForm(Form):
    username = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired(), Length(32, 32)])


class VendorConfirmForm(Form):
    vendor_id = IntegerField(validators=[DataRequired()])

    vendor = None

    def validate_vendor_id(self, field):
        vendor = Vendor.query.filter_by(id=field.data, confirmed=False).limit(1).first()
        if not vendor:
            raise ValidationError('invalidate vendor id')
        self.vendor = vendor

    def pass_vendor(self):
        self.vendor.confirmed = True
        db.session.add(self.vendor)
        db.session.commit()

    def reject_vendor(self):
        self.vendor.rejected = True
        db.session.add(self.vendor)
        db.session.commit()
