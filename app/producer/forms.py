# -*- coding: utf-8 -*-
from flask.ext.wtf import Form
from flask.ext.wtf.file import FileField, FileRequired, FileAllowed
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import ValidationError, DataRequired, Length, EqualTo

from app.utils.validator import Email, Mobile


class LoginForm(Form):
    mobile = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired()])


class RegistrationForm(Form):
    email = StringField(validators=[Email()])
    mobile = StringField(validators=[Mobile()])
    password = PasswordField(validators=[DataRequired(), Length(6, 32), EqualTo('confirm_password')])
    confirm_password = PasswordField(validators=[DataRequired(), Length(6, 32)])
    legal_person_name = StringField(validators=[DataRequired(u'必填')])
    legal_person_identity = StringField(validators=[DataRequired(u'必填'), Length(18, 18, u'身份证号码不符合规范!')])
    legal_person_identity_image = FileField(validators=[
        FileRequired(u'必填'), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])


class ProducerDetailForm(Form):
    name = StringField(validators=[DataRequired(u'必填'), Length(2, 30, u'品牌厂商名称不符合规范')])
    license_address = StringField(validators=[DataRequired(u'必填')])
    license_limit = StringField(validators=[Length(8, 8)])
    license_long_time_limit = BooleanField()
    license_image = FileField(validators=[FileRequired(u'必填'), FileAllowed(['jpg', 'png'], u'只支持jpg, png!')])
    contact_mobile = StringField(validators=[DataRequired(u'必填'), Mobile(available=False)])
    contact_telephone = StringField(validators=[DataRequired(u'必填'), Length(7, 15)])
    address = StringField(validators=[DataRequired(u'必填'), Length(1, 30)])
    # TODO: add address select

    def validate_license_limit(self, field):
        if not field.data and not self.license_long_time_limit.data:
            raise ValidationError(u'请填写营业执照期限或选择长期营业执照')