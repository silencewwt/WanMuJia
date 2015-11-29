# -*- coding: utf-8 -*-
import random
import string
from uuid import uuid4

from captcha.image import ImageCaptcha

from app.utils.redis import redis_set, redis_get
from app.constants import SMS_CAPTCHA, SMS_CAPTCHA_SENT, IMAGE_CAPTCHA
from app.sms import sms_generator

ic = ImageCaptcha()


def id_generator(size=4, chars=None):
    chars = chars or 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'
    return ''.join(random.SystemRandom().choice(chars) for _ in range(size))


def image_captcha_generator(token=uuid4().hex):
    chars = id_generator()
    captcha_output = ic.generate(chars, format='jpeg')
    redis_set(IMAGE_CAPTCHA, token, chars, 3600)
    return captcha_output


def get_image_captcha(token):
    return image_captcha_generator(token)


def sms_captcha_generator():
    return id_generator(6, string.digits)


def send_sms_captcha(template, mobile):
    if not redis_get(SMS_CAPTCHA_SENT, mobile):
        captcha_chars = sms_captcha_generator()
        redis_set(SMS_CAPTCHA, mobile, captcha_chars)
        sms_generator(template, mobile, contents=[captcha_chars])
        redis_set(SMS_CAPTCHA_SENT, mobile, True, 60)
        return True
    return False

