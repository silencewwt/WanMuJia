# -*- coding: utf-8 -*-
import base64
import hashlib
import hmac
import os
import time
import urllib

from PIL import Image
from flask import current_app, url_for

from app.utils.redis import redis_set
from ._utils import md5_with_salt, md5_with_time_salt


def _generate_dir_path(id_, dir_name):
    dir_path = 'images/%s/%s/%s/' % (dir_name, id_ % 100, md5_with_salt(id_))
    return dir_path


def save_image(id_, dir_name, field, img_stream):
    path = current_app.config['IMAGE_DIR']
    relative_path = _generate_dir_path(id_, dir_name)
    dir_path = os.path.join(path, relative_path)

    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    image_hash = md5_with_time_salt(id_, 'image')
    image_name = '%s.%s' % (image_hash, 'jpg')
    image_path = os.path.join(dir_path, image_name)

    im = Image.open(img_stream)
    im.save(image_path, format='jpeg')
    im.close()
    return relative_path + image_name, image_hash


def _oss_signature_generator(callback, resource):
    expires = '%d' % (time.time() + 600)
    msg = '{method}\n{content_md5}\n{content_type}\n{expires}\n{oss_headers}{oss_resource}'.\
        format(method='PUT', content_md5='', content_type='image/jpeg', expires=expires,
               oss_headers='x-oss-callback:%s\n' % callback, oss_resource=resource)
    return expires, base64.encodebytes(hmac.new(current_app.config['OSS_ACCESS_SECRET'].encode(),
                                                msg.encode(), hashlib.sha1).digest()).strip().decode()


def oss_authorization(item_id, filename):
    dir_path = _generate_dir_path(item_id, 'item')
    image_hash = md5_with_time_salt(item_id, 'image')
    image_name = '%s.%s' % (image_hash, 'jpg')
    image_path = os.path.join(dir_path, image_name)
    resource_path = os.path.join('/', current_app.config['OSS_BUCKET_NAME'], image_path)
    callback = '{"callbackUrl": "%s", "callbackBody": "bucket=${bucket}&object=${object}&etag=${etag}"}' \
               % url_for('vendor.image_callback', _external=True)
    callback_base64 = base64.b64encode(callback.encode()).decode()
    expires, signature = _oss_signature_generator(callback_base64, resource_path)
    headers = {'x-oss-callback': callback_base64, 'Content-Type': 'image/jpeg'}
    params = urllib.parse.urlencode({'Expires': expires, 'Signature': signature,
                                     'OSSAccessKeyId': current_app.config['OSS_ACCESS_ID']})
    url = 'http://%s/%s?%s' % (current_app.config['OSS_HOST'], image_path, params)
    redis_set('OSS', image_path, {'item_id': item_id, 'filename': filename}, expire=600, serialize=True)
    return {'url': url, 'headers': headers}
