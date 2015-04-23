# -*-coding: utf-8 -*-
from flask import current_app, request, render_template, redirect, flash, session
from flask_security import login_user, logout_user, login_required
from flask_security.utils import identity_changed, Identity

from app import db
from app.models import User
from app.constants import *


def _get_login_instance(model, username, *args):
    if 'username' in args:
        instance = model.query.filter_by(username=username).limit(1).first()
        if instance:
            return instance
    instance = model.query.filter_by(mobile=username).limit(1).first() or \
        model.query.filter_by(email=username).limit(1).first()
    return instance


def login(model, form):
    if model == User:
        instance = _get_login_instance(model, form.username.data, 'username')
    else:
        instance = _get_login_instance(model, form.username.data)
    if instance and instance.verify_password(form.password.data):
        login_user(instance, form.remember_me.data)
        identity_changed.send(current_app._get_current_object(), Identity(instance.get_id()))
        return True
    return False