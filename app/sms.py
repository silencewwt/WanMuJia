# -*- coding: utf-8 -*-
from urllib.parse import urlencode

from flask import current_app, session

from app import db
from app.models import GuideSMS, User
from app.tasks import send_sms


USER_REGISTER_TEMPLATE = 'USER_REGISTER_TEMPLATE'
RESET_PASSWORD_TEMPLATE = 'RESET_PASSWORD_TEMPLATE'
USER_GUIDE_TEMPLATE = 'USER_GUIDE_TEMPLATE'
USER_SMS_CAPTCHA_TEMPLATE = 'USER_SMS_CAPTCHA_TEMPLATE'
VENDOR_REGISTER_TEMPLATE = 'VENDOR_REGISTER_TEMPLATE'
VENDOR_PENDING_TEMPLATE = 'VENDOR_PENDING_TEMPLATE'
VENDOR_ACCEPT_TEMPLATE = 'VENDOR_ACCEPT_TEMPLATE'

template_dict = {
    USER_GUIDE_TEMPLATE: '尊敬的万木家会员您好，您所选择的体验店位置为{address}，联系电话400-863-7896转{ext_number}，感谢您对万木家的信赖！',
    USER_SMS_CAPTCHA_TEMPLATE: '尊敬的万木家用户您好，您的验证码为{verify_code}，请勿将验证码告诉他人！(验证码十分钟内有效)',
    USER_REGISTER_TEMPLATE: '尊敬的万木家用户您好，您的验证码是{verify_code}，感谢您的注册！（验证码十分钟内有效）',
    RESET_PASSWORD_TEMPLATE: '尊敬的万木家会员您好，欢迎您回家，为方便您找回密码，请输入验证码{verify_code}（验证码十分钟内有效）',
    VENDOR_REGISTER_TEMPLATE: '尊敬的万木家厂商您好，欢迎您选择入驻万木家平台，您的验证码是{verify_code}（验证码十分钟内有效），感谢您的认证！',
    VENDOR_PENDING_TEMPLATE: '尊敬的万木家厂商您好，欢迎您选择入驻万木家平台，我们会在3个工作日内对您所提交的信息进行审核',
    VENDOR_ACCEPT_TEMPLATE: '尊敬的万木家厂商您好，恭喜您的信息通过了审核，万木家期待您的精美商品，快快上传吧。'
}


def sms_generator(template, mobile, **kwargs):
    if template in (VENDOR_ACCEPT_TEMPLATE, VENDOR_PENDING_TEMPLATE):
        message = template_dict[template]
    elif template in (USER_SMS_CAPTCHA_TEMPLATE, USER_REGISTER_TEMPLATE,
                      VENDOR_REGISTER_TEMPLATE, RESET_PASSWORD_TEMPLATE):
        message = template_dict[template].format(verify_code=kwargs['verify_code'])
    elif template == USER_GUIDE_TEMPLATE:
        message = template_dict[template].format(address=kwargs['address'], ext_number=kwargs['ext_number'])
        if 'user_id' in session and session['user_id'][0] == 'u' and User.query.get(session['user_id'][1:]):
            user_id = session['user_id'][1:]
        else:
            user_id = 0
        record = GuideSMS(mobile, item_id=kwargs['item_id'], distributor_id=kwargs['distributor_id'], user_id=user_id)
        db.session.add(record)
        db.session.commit()
    else:
        return
    query = urlencode({'mobile': mobile, 'account': current_app.config['SMS_ACCOUNT'],
                       'pswd': current_app.config['SMS_PASSWORD'], 'msg': message})
    send_sms.delay('%s?%s' % (current_app.config['SMS_URL'], query))
