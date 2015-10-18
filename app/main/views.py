# -*- coding: utf-8 -*-
from flask import render_template, abort
from flask.ext.login import current_user

from .import main


@main.route('/')
def index():
    return render_template('user/index.html', user=current_user)


@main.route('/legal/<string:role>')
def legal(role):
    if role == 'user':
        return render_template('site/user_legal.html', user=current_user)
    elif role == 'vendor':
        return render_template('site/vendor_legal.html', user=current_user)
    abort(404)


@main.route('/about')
def about():
    return render_template('site/about.html', user=current_user)


@main.route('/join')
def join():
    return render_template('site/join.html', user=current_user)


@main.route('/center')
def center():
    return render_template('site/center.html', user=current_user)
