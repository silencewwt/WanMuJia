# -*- coding: utf-8 -*-
import requests
from json import loads

from flask_celery3 import make_celery
from flask.ext.mail import Mail

from app import create_mail_app


mail_app = create_mail_app()
mail = Mail(mail_app)
celery = make_celery(mail_app)


@celery.task(name='send_email')
def send_email(msg):
    mail.send(msg)


@celery.task(name='send_sms')
def send_sms(url):
    response = requests.get(url)
    response = loads(response.content.decode('utf8'))
    print(response['resp']['respCode'])
