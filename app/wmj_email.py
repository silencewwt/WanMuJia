# -*- coding: utf-8 -*-
from flask.ext.mail import Message

from app import app
from app.tasks import send_email as async_email


VENDOR_EMAIL_CONFIRM = 'VENDOR_EMAIL_CONFIRM'
USER_EMAIL_CONFIRM = 'USER_EMAIL_CONFIRM'


def send_email(to, subject, email_type, **kwargs):
    msg = Message(app.config['WMJ_MAIL_SUBJECT_PREFIX'] + ' ' + subject,
                  sender=app.config['WMJ_MAIL_SENDER'], recipients=[to])
    msg.body = '万木家'
    msg.html = '欢迎注册万木家'
    async_email.delay(msg)
