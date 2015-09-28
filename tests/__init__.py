# -*- coding: utf-8 -*-
import json
import redis
import unittest
from hashlib import md5
from app import create_app, db
from app.models import generate_fake_data


class WMJTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        self.client = self.app.test_client()
        self.redis = redis.StrictRedis(host='localhost', port=6379, db=0)

        db.drop_all()
        db.create_all()
        connection = db.engine.connect()
        sql_files = ['cities.sql', 'districts.sql', 'provinces.sql']
        for sql_file in sql_files:
            with open(sql_file, encoding='utf8') as f:
                connection.execute(f.read())
        generate_fake_data()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

    def assert_status_code(self, response, status_code):
        self.assertEquals(status_code, response.status_code)
        return response

    def assert_ok(self, response):
        return self.assert_status_code(response, 200)

    def assert_not_found(self, response):
        return self.assert_status_code(response, 404)

    def assert_content_type(self, response, content_type):
        self.assertEquals(content_type, response.headers['Content-Type'])
        return response

    def assert_json(self, response):
        self.assert_content_type(response, 'application/json')
        return response

    def assert_ok_json(self, response):
        self.assert_ok(self.assert_json(response))
        return response

    def assert_html(self, response):
        self.assert_content_type(response, 'text/html; charset=utf-8')
        return response

    def assert_ok_html(self, response):
        self.assert_ok(self.assert_html(response))
        return response

    def twice_md5(self, password):
        if not isinstance(password, bytes):
            password = bytes(password, encoding='utf8')
        return md5(md5(password).hexdigest().encode('utf8')).hexdigest()

    def load_json(self, response):
        return json.loads(response.data.decode('utf8'))
