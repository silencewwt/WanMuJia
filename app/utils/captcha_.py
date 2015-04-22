# -*-coding: utf-8 -*-
import random
import string

from captcha.image import ImageCaptcha

from redis import redis_set, redis_verify, redis_get
from ..constants import SMS_CAPTCHA, SMS_CAPTCHA_SENT
from ..sms import sms_generator

ic = ImageCaptcha()


def id_generator(size=4, chars=None):
    chars = chars or 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'
    return ''.join(random.SystemRandom().choice(chars) for _ in range(size))


def image_captcha_generator():
    captcha_output = ic.generate(id_generator())
    return captcha_output


def sms_captcha_generator():
    return id_generator(6, string.digits)


def send_sms_captcha(mobile):
    if not redis_get(SMS_CAPTCHA_SENT, mobile):
        captcha_chars = sms_captcha_generator()
        redis_set(SMS_CAPTCHA, mobile, captcha_chars)
        sms_generator(SMS_CAPTCHA, mobile, captcha=captcha_chars)
        redis_set(SMS_CAPTCHA_SENT, mobile, True, 60)
        return True
    return False


def verify_sms_captcha(mobile, sms_captcha):
    return redis_verify(SMS_CAPTCHA, mobile, sms_captcha)