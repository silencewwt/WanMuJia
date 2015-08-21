# -*- coding: utf-8 -*-
from flask.ext.mail import Message

from app import app
from app.tasks import send_email as async_email


VENDOR_EMAIL_CONFIRM = 'VENDOR_EMAIL_CONFIRM'
USER_REGISTER = 'USER_REGISTER'
USER_EMAIL_CONFIRM = 'USER_EMAIL_CONFIRM'
ADMIN_REMINDS = 'ADMIN_REMINDS'
ADMIN_REMINDS_SUBJECT = '新的厂家注册'
EMAIL_CONFIRM_SUBJECT = u'激活邮箱'
EMAIL_CONFIRM_TEMPLATE = '<p>尊敬的万木家用户:</p><p>感谢注册万木家, 请点击下面的链接以激活邮箱</p><a href="%s">%s</a>'


def send_email(to, subject, email_type, **kwargs):
    if email_type == VENDOR_EMAIL_CONFIRM or email_type == USER_EMAIL_CONFIRM:
        msg = Message(subject, sender=app.config['WMJ_MAIL_SENDER'], recipients=[to])
        msg.body = '万木家'
        msg.html = EMAIL_CONFIRM_TEMPLATE % (kwargs['url'], kwargs['url'])
        async_email.delay(msg)
    elif email_type == ADMIN_REMINDS:
        msg = Message(subject, sender=app.config['WMJ_MAIL_SENDER'], recipients=to)
        msg.html = '<p>有新的厂家注册了, 快去审核!</p>'
        async_email.delay(msg)
