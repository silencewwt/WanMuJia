# -*-coding: utf-8 -*-
from flask import current_app, request, render_template, redirect, flash, session
from flask_security import login_user, logout_user, login_required
from flask_security.utils import identity_changed, Identity

from app import db
from app.models import User, Producer, Dealer
from app.constants import *
from app.forms import *


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


def reset_password(model, url_prefix):
    mobile_form = MobileResetPasswordForm()
    email_form = EmailResetPasswordForm()
    reset_form = ResetPasswordForm()
    if mobile_form.validate_on_submit():
        # TODO: store data in redis
        session['reset'] = True
        session['mobile'] = mobile_form.mobile.data
        return 'mobile ok'
    elif email_form.validate_on_submit():
        session['reset'] = True
        session['email'] = email_form.email.data
        return 'email ok'
    elif 'reset' in session and session['reset'] is True:
        if 'mobile' in session:
            instance = model.query.filter_by(mobile=session['mobile']).first()
            session.pop('mobile')
        elif 'email' in session:
            instance = model.query.filter_by(email=session['email']).first()
            session.pop('email')
        else:
            return 'error', 401
        if instance:
            instance.password = reset_form.password.data
            session.pop('reset')
            return 'reset password success'
        else:
            return 'error', 401
    return render_template('%s/reset_password.html' % url_prefix, mobile_form=mobile_form, email_form=email_form)