# -*- coding: utf-8 -*-
import datetime
from hashlib import md5

from app.tasks import send_sms


USER_REGISTER_TEMPLATE = '6253'
RESET_PASSWORD_TEMPLATE = '6256'
USER_GUIDE_TEMPLATE = '6259'
VENDOR_REGISTER_TEMPLATE = '10015'
VENDOR_PENDING_TEMPLATE = '10016'
VENDOR_ACCEPT_TEMPLATE = '10017'

request_url = 'http://www.ucpaas.com/maap/sms/code?sid={sid}&appId={app_id}&time={timestamp}&sign={signature}&to={to}&' \
              'templateId={template_id}&param={param}'

account_id = '0f81a2d248c05bbf6d7008c730339c9a'
app_id = 'fed07ea7087b4b6aa2691b1539bcf4f0'
auth_token = '831e82a3112327c99ca213604e95caa1'


def _sig_generator(timestamp):
    return md5(bytes('%s%s%s' % (account_id, timestamp, auth_token), encoding='latin-1')).hexdigest()


def _timestamp_generator():
    return datetime.datetime.now().strftime('%G%m%e%H%M%S') + '000'


def _api_param_generator():
    timestamp = _timestamp_generator()
    signature = _sig_generator(timestamp)
    return timestamp, signature


def sms_generator(template, mobile, *contents, **kwargs):
    if template == VENDOR_PENDING_TEMPLATE:
        contents = ['3']
    elif template == VENDOR_ACCEPT_TEMPLATE:  # 短信模板必须传参数
        contents = [u'信息']
    timestamp, signature = _api_param_generator()
    url = request_url.format(
        sid=account_id, app_id=app_id, timestamp=timestamp, signature=signature, to=mobile,
        template_id=template, param=','.join(contents))
    send_sms.delay(url)
