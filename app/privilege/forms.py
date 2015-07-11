# -*- coding: utf-8 -*-
from flask.ext.login import current_user
from flask.ext.wtf import Form
from wtforms import StringField, PasswordField, IntegerField, BooleanField
from wtforms.validators import ValidationError, DataRequired, Length

from app import db
from app.models import Vendor, Distributor, DistributorRevocation


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


class VendorConfirmRejectForm(VendorConfirmForm):
    reject_message = StringField(validators=[DataRequired(), Length(1, 100)])

    def reject_vendor(self):
        self.vendor.rejected = True
        self.vendor.reject_message = self.reject_message.data
        db.session.add(self.vendor)
        db.session.commit()


class DistributorRevocationForm(Form):
    distributor_revocation_id = IntegerField(validators=[DataRequired()])
    revocation_confirm = BooleanField(validators=[DataRequired()])

    distributor_revocation = None

    def validate_distributor_id(self, field):
        distributor_revocation = DistributorRevocation.query.get(field.data)
        if not distributor_revocation:
            raise ValidationError()
        self.distributor_revocation = distributor_revocation

    def revoke(self):
        if self.revocation_confirm.data:
            self.distributor_revocation.pending = False
            self.distributor_revocation.is_revoked = True
            self.distributor_revocation.distributor.is_deleted = True
            db.session.add(self.distributor_revocation.distributor)
        else:
            self.distributor_revocation.pending = False
        db.session.add(self.distributor_revocation)
        db.session.commit()
