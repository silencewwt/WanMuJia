# -*- coding: utf-8 -*-
from flask.ext.wtf import Form
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Length, EqualTo


class LoginForm(Form):
    mobile = StringField(validators=[DataRequired()])
    password = PasswordField(validators=[DataRequired()])