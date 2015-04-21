# -*-coding: utf-8 -*-
from constants import SMS_CAPTCHA
from tasks import send_sms


SMS_CAPTCHA_CONTENT = u'尊敬的木一家用户，您的验证码为%s，请您尽快完成操作，感谢您的使用！'


def sms_generator(sms_type, mobile, **kwargs):
    if sms_type == SMS_CAPTCHA:
        msg = SMS_CAPTCHA_CONTENT % kwargs['captcha']
        send_sms.delay(msg, mobile)