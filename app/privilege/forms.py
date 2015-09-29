# -*- coding: utf-8 -*-
import time

from flask import current_app
from flask.ext.cdn import url_for
from flask.ext.login import login_user
from flask.ext.principal import identity_changed, Identity
from wtforms import StringField, PasswordField, IntegerField, BooleanField
from wtforms.validators import ValidationError, DataRequired, Length

from app import db
from app.constants import VENDOR_REMINDS_SUCCESS, VENDOR_REMINDS_REJECTED
from app.forms import Form
from app.models import Vendor, DistributorRevocation, Privilege
from app.sms import sms_generator, VENDOR_ACCEPT_TEMPLATE
from app.vendor.forms import ItemForm as BaseItemForm


class LoginForm(Form):
    username = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired(), Length(32, 32)])

    def login(self):
        privilege = Privilege.query.filter_by(username=self.username.data).limit(1).first() or \
            Privilege.query.filter_by(email=self.username.data).limit(1).first()
        if privilege and privilege.verify_password(self.password.data):
            login_user(privilege)
            identity_changed.send(current_app._get_current_object(), identity=Identity(privilege.get_id()))
            return True
        return False


class VendorDetailForm(Form):
    name = StringField()
    email = StringField()
    agent_name = StringField()
    agent_identity = StringField()
    license_limit = StringField()
    address = StringField()

    attributes = ('name', 'email', 'agent_name', 'agent_identity', 'license_limit')
    image_urls = ('agent_identity_front', 'agent_identity_back', 'license_image')

    def show_info(self, vendor):
        for attr in self.attributes:
            getattr(self, attr).data = getattr(vendor, attr)
        self.address.data = vendor.address.precise_address()
        for url in self.image_urls:
            setattr(self, url, url_for('static', filename=getattr(vendor, url)))


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
        self.vendor.confirmed_time = time.time()
        self.vendor.item_permission = True
        self.vendor.push_confirm_reminds(VENDOR_REMINDS_SUCCESS)
        sms_generator(VENDOR_ACCEPT_TEMPLATE, self.vendor.mobile)
        db.session.add(self.vendor)
        db.session.commit()


class VendorConfirmRejectForm(VendorConfirmForm):
    reject_message = StringField()

    def reject_vendor(self):
        self.vendor.rejected = True
        self.vendor.reject_message = self.reject_message.data
        self.vendor.push_confirm_reminds(VENDOR_REMINDS_REJECTED, self.reject_message.data)
        db.session.add(self.vendor)
        db.session.commit()


class DistributorRevocationForm(Form):
    distributor_revocation_id = IntegerField(validators=[DataRequired()])
    revocation_confirm = BooleanField()

    distributor_revocation = None

    def validate_distributor_revocation_id(self, field):
        if field.data is None:
            raise ValidationError('参数错误')
        distributor_revocation = DistributorRevocation.query.get(field.data)
        if not distributor_revocation:
            raise ValidationError()
        self.distributor_revocation = distributor_revocation

    def revoke(self):
        if self.revocation_confirm.data:
            self.distributor_revocation.is_revoked = True
            self.distributor_revocation.distributor.is_deleted = True
            db.session.add(self.distributor_revocation.distributor)
        self.distributor_revocation.pending = False
        db.session.add(self.distributor_revocation)
        db.session.commit()


class ItemForm(BaseItemForm):
    vendor = StringField()

    def show_item(self, item):
        super(ItemForm, self).show_item(item)
        self.vendor.data = item.vendor.name
