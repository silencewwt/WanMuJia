# -*- coding: utf-8 -*-
from flask import url_for

from tests import WMJTestCase
from app import db, statisitc
from app.models import User, Item, Vendor


class UserTestCase(WMJTestCase):
    def add_user(self):
        password_hash = self.twice_md5(b'123456')
        user = User(password_hash, '18345678901', '', 'nickname')
        db.session.add(user)
        db.session.commit()

    def test_login(self):
        # add a user
        self.add_user()

        # login fail
        self.client.get(url_for('user.login'))
        response = self.client.post(url_for('user.login'), data={'username': '18345678901', 'password': 'wrongpasswd'})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertFalse(json_response['success'])
        self.assertIn('message', json_response)

        # login success
        password_hash = self.twice_md5(b'123456')
        response = self.client.post(url_for('user.login'), data={'username': '18345678901', 'password': password_hash})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertTrue(json_response['success'])
        response = self.client.get(url_for('user.profile'))
        self.assert_ok_html(response)

    def test_mobile_register(self):
        #  wrong captcha
        self.client.get(url_for('user.register'))
        response = self.client.post(url_for('user.register'), data={'mobile': '13000000000', 'captcha': '000000'})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertFalse(json_response['success'])
        self.assertIn('message', json_response)
        response = self.client.get(url_for('user.register_next'))
        self.assert_status_code(response, 302)

        # right captcha
        self.client.get(url_for('user.register'))
        self.redis.set('SMS_CAPTCHA:13100000000', '000000', 1)
        response = self.client.post(url_for('user.register'), data={'mobile': '13100000000', 'captcha': '000000'})
        json_response = self.load_json(response)
        self.assertTrue(json_response['success'])

        # register next fail
        response = self.client.get(url_for('user.register_next'))
        self.assert_ok_html(response)
        password_hash = self.twice_md5('123456')
        data = {
            'password': password_hash,
            'confirm_password': password_hash,
        }
        temp_data = {}
        for key in data:
            temp_data[key] = data[key]
            response = self.client.post(url_for('user.register_next'), data=temp_data)
            self.assert_ok_json(response)
            json_response = self.load_json(response)
            self.assertFalse(json_response['success'])
            self.assertIn('message', json_response)

        for invalidate_nickname in ['a23', '1234567', 'a' * 31]:
            temp_data['nickname'] = invalidate_nickname
            response = self.client.post(url_for('user.register_next'), data=temp_data)
            self.assert_ok_json(response)
            json_response = self.load_json(response)
            self.assertFalse(json_response['success'])
            self.assertIn('message', json_response)

        # register next success
        temp_data['nickname'] = data['nickname'] = 'nickname'
        response = self.client.post(url_for('user.register_next'), data=data)
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertTrue(json_response['success'])
        response = self.client.get(url_for('user.profile'))
        self.assert_ok_html(response)

        # register result
        response = self.client.get(url_for('user.register_result'))
        self.assert_ok_html(response)

        # register result redirect to index
        response = self.client.get(url_for('user.register_result'))
        self.assert_status_code(response, 302)

    def test_item(self):
        # set up
        Vendor.generate_fake(10)
        Item.generate_fake(10)
        statisitc.init_statistic()
        self.add_user()
        self.redis.delete('INDEX_ITEMS:ITEMS')

        # item list
        response = self.client.get(url_for('item.item_list'))
        self.assert_ok_html(response)

        response = self.client.get(url_for('main.index'))
        self.assert_ok_html(response)
