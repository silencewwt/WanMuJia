# -*- coding: utf-8 -*-
import json
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
        json_response = json.loads(response.data.decode('utf8'))
        self.assertFalse(json_response['accessGranted'])

        # login success
        response = self.client.post(url_for('vendor.login'), data={'mobile': '18345678901', 'password': password_hash})
        self.assert_ok_json(response)
        json_response = json.loads(response.data.decode('utf8'))
        self.assertTrue(json_response['accessGranted'])
        response = self.client.get(url_for('vendor.index'))
        self.assert_ok(response)
