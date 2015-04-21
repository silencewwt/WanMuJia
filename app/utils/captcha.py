# -*-coding: utf-8 -*-
import random
import string

from captcha.image import ImageCaptcha

from ..tasks import send_sms

ic = ImageCaptcha()


def id_generator(size=4, chars=string.ascii_uppercase + string.digits[1:]):
    return ''.join(random.SystemRandom().choice(chars) for _ in range(size))


def image_captcha_generator(chars=id_generator()):
    captcha_output = ic.generate_image(chars)
    return captcha_output


def send_captcha(type_, mobile):
    pass