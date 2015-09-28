# -*- coding: utf-8 -*-
import base64
from flask import url_for
from tests import WMJTestCase
from app import db
from app.models import Vendor


class VendorTestCase(WMJTestCase):
    def test_login(self):
        # add a vendor
        password_hash = self.twice_md5(b'123456')
        vendor = Vendor(password_hash, '18345678901', 'test@wanmujia.com', u'万木家', '123456789012345678', u'万木家',
                        '2035/09/11', '01012345678')
        db.session.add(vendor)
        db.session.commit()

        # login fail
        response = self.client.post(url_for('vendor.login'),
                                    data={'mobile': '18345678901', 'password': 'wrong password'})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertFalse(json_response['accessGranted'])

        # login success
        response = self.client.post(url_for('vendor.login'), data={'mobile': '18345678901', 'password': password_hash})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertTrue(json_response['accessGranted'])
        response = self.client.get(url_for('vendor.index'))
        self.assert_ok_html(response)

    def test_register(self):
        # wrong captcha
        self.client.get(url_for('vendor.register'))
        response = self.client.post(url_for('vendor.register'), data={'mobile': '13100000000', 'captcha': '000000'})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertFalse(json_response['accessGranted'])
        self.assertIn('message', json_response)

        # right captcha
        self.client.get(url_for('vendor.register'))
        self.redis.set('SMS_CAPTCHA:13100000000', '000000', 1)
        response = self.client.post(url_for('vendor.register'), data={'mobile': '13100000000', 'captcha': '000000'})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertTrue(json_response['accessGranted'])

        # register detail
        data = {
            'email': 'test@wanmujia.com',
            'password': self.twice_md5('123456'),
            'confirm_password': self.twice_md5('123456'),
            'agent_name': 'agent',
            'agent_identity': '123456789012345678',
            'agent_identity_front': b'*' * 23 + base64.b64encode(open('test.jpg', 'rb').read()),
            'agent_identity_back': b'*' * 23 + base64.b64encode(open('test.jpg', 'rb').read()),
            'license_image': b'*' * 23 + base64.b64encode(open('test.jpg', 'rb').read()),
            'name': 'wanmujia',
            'license_limit':  '2035/10/19',
            'telephone': '01012345678',
            'address': 'vendor address',
            'district_cn_id': '110111'
        }
        temp_data = {}
        for key in data:
            temp_data[key] = data[key]
            response = self.client.get(url_for('vendor.register'))
            self.assert_ok_html(response)
            response = self.client.post(url_for('vendor.register'), data=temp_data)
            self.assert_ok_json(response)
            json_response = self.load_json(response)
            if len(temp_data) == len(data):
                self.assertTrue(json_response['accessGranted'])
            else:
                self.assertFalse(json_response['accessGranted'])
                self.assertIn('message', json_response)
        response = self.client.get(url_for('vendor.index'))
        self.assert_ok_html(response)

        # login
        response = self.client.get(url_for('vendor.login'))
        self.assert_ok_html(response)
        response = self.client.post(url_for('vendor.login'), data={'mobile': '13100000000', 'password': self.twice_md5('123456')})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertTrue(json_response['accessGranted'])
        response = self.client.get(url_for('vendor.index'))
        self.assert_ok_html(response)

        # logout
        response = self.client.get(url_for('vendor.logout'))
        self.assert_status_code(response, 302)
        self.assertEquals(response.location, url_for('vendor.login', _external=True))

        # with out login
        response = self.client.get(url_for('vendor.index'))
        self.assert_status_code(response, 302)
        self.assertTrue(response.location.startswith(url_for('vendor.login', _external=True)))
