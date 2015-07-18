# -*- coding: utf-8 -*-
import os

from flask import current_app

from ._utils import md5_with_salt, md5_with_time_salt


def generate_dir_path(id_, dir_name):
    dir_path = '%s/%s/%s/' % (dir_name, id_ % 100, md5_with_salt(id_))
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    return dir_path


def save_image(id_, dir_name, field):
    path = current_app.config['IMAGE_DIR']
    relative_path = generate_dir_path(id_, dir_name)
    dir_path = os.path.join(path, relative_path)
    ext = field.data.filename.rsplit('.', 1)[-1]
    image_hash = md5_with_time_salt(id_, 'image')
    image_name = '%s.%s' % (image_hash, ext)
    image_path = os.path.join(dir_path, image_name)
    field.data.save(image_path)
    return relative_path + image_name, image_hash
