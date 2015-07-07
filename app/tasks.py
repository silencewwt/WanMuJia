# -*- coding: utf-8 -*-
from flask_celery3 import make_celery

from app import app, mail


celery = make_celery(app)


@celery.task
def send_mail(msg):
    mail.send(msg)


@celery.task
def send_sms(msg, mobile):
    pass
