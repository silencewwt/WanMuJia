# -*- coding: utf-8 -*-
import os
from hashlib import md5
from uuid import uuid4

from flask import current_app


def generate_dir_path(id_):
    return '%s/vendor_%s/' % (id_ % 100, md5(str(id_)).hexdigest())


def save_image(id_, field):
    path = current_app.config['IMAGE_DIR']
    relative_path = generate_dir_path(id_)
    dir_path = os.path.join(path, relative_path)
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
    ext = field.data.filename.rsplit('.', 1)[-1]
    image_name = '%s.%s' % (uuid4().hex, ext)
    image_path = os.path.join(dir_path, image_name)
    field.data.save(image_path)
    return relative_path + image_name
