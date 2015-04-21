# -*-coding: utf-8 -*-
import random
import string

from captcha.image import ImageCaptcha

from redis import redis_set
from ..tasks import send_sms

ic = ImageCaptcha()


def id_generator(size=4, chars=None):
    chars = chars or string.ascii_uppercase + string.digits[1:]
    return ''.join(random.SystemRandom().choice(chars) for _ in range(size))


def image_captcha_generator():
    captcha_output = ic.generate_image(id_generator())
    return captcha_output


def sms_captcha_generator():
    return id_generator(6, string.digits)


def send_captcha(type_, mobile):
    captcha_chars = sms_captcha_generator()
    pass