# -*- coding: utf-8 -*-
from flask import render_template, url_for, request
from werkzeug.datastructures import ImmutableMultiDict
from flask.ext.login import current_user
from app.utils.forms import Form
from wtforms.fields import StringField
import json
from .import main


@main.route('/')
def index():
    return render_template('user/index.html', user=current_user)


@main.route('/test', methods=['GET', 'POST'])
def main_test():
    form = TestForm()
    if request.method == 'POST':
        form_data = request.form
        print(form_data)
        # request.form = ImmutableMultiDict({'username': 'wtf', 'password': '123456'})
        # request.form = {'username': 'wtf', 'password': '123456'}
        form = TestForm(ImmutableMultiDict({'username': 'wtf', 'password': '123456'}))
        print(form.username.data)
    return 'ok'


class TestForm(Form):
    username = StringField()
