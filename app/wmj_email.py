# -*- coding: utf-8 -*-
from flask import current_app, render_template
from flask.ext.mail import Message

from app.tasks import send_email as async_email


VENDOR_EMAIL_CONFIRM = 'VENDOR_EMAIL_CONFIRM'
USER_REGISTER = 'USER_REGISTER'
USER_EMAIL_CONFIRM = 'USER_EMAIL_CONFIRM'
USER_RESET_PASSWORD = 'USER_RESET_PASSWORD'
ADMIN_REMINDS = 'ADMIN_REMINDS'
ADMIN_REMINDS_SUBJECT = '新的厂家注册'
EMAIL_CONFIRM_SUBJECT = u'激活邮箱'


def send_email(to, subject, email_type, **kwargs):
    msg = Message(subject, sender=current_app.config['WMJ_MAIL_SENDER'], recipients=[to])
    if email_type == VENDOR_EMAIL_CONFIRM:
        msg.html = render_template('site/vendor_email_confirm.html', url=kwargs['url'])
    elif email_type == USER_EMAIL_CONFIRM:
        msg.html = render_template('site/user_email_confirm.html', url=kwargs['url'])
    elif email_type == ADMIN_REMINDS:
        msg.html = '<p>有新的厂家注册了, 快去审核!</p>'
    # elif email_type == USER_REGISTER:
    #     msg.html = render_template('site/user_register.html', url=kwargs['url'])
        async_email.delay(msg)
    elif email_type == USER_RESET_PASSWORD:
        msg.html = render_template('site/user_reset_password.html', url=kwargs['url'])
    async_email.delay(msg)
