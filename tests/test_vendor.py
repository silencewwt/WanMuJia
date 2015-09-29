# -*- coding: utf-8 -*-
import base64
from io import StringIO, BytesIO
from flask import url_for

from tests import WMJTestCase
from app import db
from app.models import Vendor, Item


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
        response = self.client.get(url_for('vendor.register'))
        self.assert_ok_html(response)
        password_hash = self.twice_md5('123456')
        with open('test.jpg', 'rb') as jpeg:
            jpeg_base64 = b'*' * 23 + base64.b64encode(jpeg.read())
        data = {
            'email': 'test@wanmujia.com',
            'password': password_hash,
            'confirm_password': password_hash,
            'agent_name': 'agent',
            'agent_identity': '123456789012345678',
            'agent_identity_front': jpeg_base64,
            'agent_identity_back': jpeg_base64,
            'license_image': jpeg_base64,
            'name': 'wanmujia',
            'license_limit':  '2035/10/19',
            'telephone': '01012345678',
            'address': 'vendor address',
            'district_cn_id': '110111'
        }
        temp_data = {}
        for key in data:
            temp_data[key] = data[key]
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
        response = self.client.post(url_for('vendor.login'), data={'mobile': '13100000000', 'password': password_hash})
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

    def test_new_single(self):
        # add a vendor
        password_hash = self.twice_md5(b'123456')
        vendor = Vendor(password_hash, '13100000000', 'test@wanmujia.com', u'万木家', '123456789012345678', u'万木家',
                        '2035/09/11', '01012345678')
        vendor.confirmed = True
        vendor.item_permission = True
        vendor.initialized = True
        db.session.add(vendor)
        db.session.commit()

        # login success
        response = self.client.post(url_for('vendor.login'), data={'mobile': '13100000000', 'password': password_hash})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertTrue(json_response['accessGranted'])
        response = self.client.get(url_for('vendor.index'))
        self.assert_ok_html(response)

        # new single
        response = self.client.get(url_for('vendor.new_item'), query_string={'type': 'single'})
        self.assert_ok_html(response)
        data = {
            'length': '123',
            'width': '321.1',
            'height': '222',
            'area': '123.21',
            'price': '99999.9',
            'second_material_id': '1',
            'category_id': '1',
            'second_scene_id': '1',
            'stove_id': '1',
            'carve_id': [1, 2],
            'outside_sand_id': '1',
            'inside_sand_id': '1',
            'paint_id': '1',
            'decoration_id': '1',
            'tenon_id': [1, 2]
        }
        temp_data = {}
        for key in data:
            temp_data[key] = data[key]
            response = self.client.post(url_for('vendor.new_item'), query_string={'type': 'single'}, data=temp_data)
            self.assert_ok_json(response)
            json_response = self.load_json(response)
            self.assertFalse(json_response['success'])
            self.assertIn('message', json_response)
        data['item'] = 'item name'
        response = self.client.post(url_for('vendor.new_item'), query_string={'type': 'single'}, data=data)
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertTrue(json_response['success'])
        self.assertIsNotNone(json_response['item_id'])
        item_id = json_response['item_id']

        # item list
        response = self.client.get(url_for('vendor.item_list'))
        self.assert_ok_html(response)
        response = self.client.get(url_for('vendor.items_data_table'))
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertIsNotNone(json_response)

        # item detail
        response = self.client.get(url_for('vendor.item_detail', item_id=item_id))
        self.assert_ok_html(response)

        # update item fail
        response = self.client.put(url_for('vendor.item_detail', item_id=item_id), data=temp_data)
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertFalse(json_response['success'])

        # update item success
        data['item'] = 'new name'
        data['tenon_id'] = [3, 4]
        data['carve_id'] = [3, 4]
        response = self.client.put(url_for('vendor.item_detail', item_id=item_id), data=data)
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertTrue(json_response['success'])

        # item image fail
        response = self.client.put(url_for('vendor.upload_item_image'), query_string={'item_id': item_id})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertFalse(json_response['success'])
        self.assertIn('message', json_response)

        # item image success
        images = []
        for i in range(2):
            image = (BytesIO(open('test.jpg', 'rb').read()), 'test.jpg')
            response = self.client.put(url_for('vendor.upload_item_image'), query_string={'item_id': item_id},
                                       data={'item_id': str(item_id), 'file': image})
            self.assert_ok_json(response)
            json_response = self.load_json(response)
            self.assertTrue(json_response)
            response = self.client.get(json_response['image']['url'])
            self.assert_content_type(response, 'image/jpeg')
            images.append(json_response['image'])

        image_hashes = [image['hash'] for image in images]
        image_hashes.reverse()
        hashes_str = ','.join(image_hashes)

        # item image sort fail
        response = self.client.post(url_for('vendor.update_item_image_sort'),
                                    data={'item_id': '0', 'images': hashes_str + ',wrong hash'})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertFalse(json_response['success'])

        # item image sort success
        response = self.client.post(url_for('vendor.update_item_image_sort'),
                                    data={'item_id': item_id, 'images': hashes_str})
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertTrue(json_response['success'])

        # delete item image fail for no hash
        response = self.client.delete(url_for('vendor.upload_item_image'))
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertFalse(json_response['success'])

        # delete item image fail
        for image_hash in image_hashes:
            response = self.client.delete(url_for('vendor.upload_item_image'), data={'image_hash': image_hash})
            self.assert_ok_json(response)
            json_response = self.load_json(response)
            self.assertTrue(json_response['success'])

        item = Item.query.get(item_id)
        item.vendor_id = 0
        db.session.commit()

        # item detail 403
        response = self.client.get(url_for('vendor.item_detail', item_id=item_id))
        self.assert_status_code(response, 403)

        item.vendor_id = vendor.id
        db.session.commit()

        # item detail method not allowed
        response = self.client.post(url_for('vendor.item_detail', item_id=item_id))
        self.assert_status_code(response, 405)

        # delete item
        response = self.client.delete(url_for('vendor.item_detail', item_id=item_id))
        self.assert_ok_json(response)
        json_response = self.load_json(response)
        self.assertTrue(json_response['success'])

        # item detail fail
        response = self.client.get(url_for('vendor.item_detail', item_id=item_id))
        self.assert_status_code(response, 404)
