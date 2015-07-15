# -*- coding: utf-8 -*-
from json import loads
import requests
from flask_celery3 import make_celery

from app import app, mail


celery = make_celery(app)


@celery.task
def send_mail(msg):
    mail.send(msg)


@celery.task
def send_sms(url):
    response = requests.get(url)
    response = loads(response.content)
    print(response['resp']['respCode'])
