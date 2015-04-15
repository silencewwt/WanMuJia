# -*- coding: utf-8 -*-
from flask import current_app, flash, render_template, redirect
from flask_security import login_user, logout_user, login_required
from flask_security.utils import identity_changed, Identity

from app import db
from app.models import Producer
from .import producer as producer_blueprint
from .forms import LoginForm


@producer_blueprint.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        producer = Producer.query.filter_by(mobile=form.mobile.data).first() or \
            Producer.query.filter_by(email=form.mobile.data).first()
        if producer and producer.verify_password(form.password.data):
            login_user(producer)
            identity_changed(current_app._get_current_object(), Identity(producer.get_id()))
            return redirect('/')    # TODO: login redirect
        flash(u'用户名或密码错误!')
    return render_template('user/login.html', login_form=form)