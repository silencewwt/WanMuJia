# -*- coding: utf-8 -*-
import json
import requests

from flask.ext.celery3 import make_celery

from app import db, mail, create_celery_app
from app.models import Distributor, DistributorAddress


celery_app = create_celery_app()
celery = make_celery(celery_app)

geo_coding_url = 'http://api.map.baidu.com/geocoder/v2/?address=%s&output=json&ak=sdp9qCbToS7E23nDRxaAAwbh'
create_poi_url = 'http://api.map.baidu.com/geodata/v3/poi/create'
update_poi_url = 'http://api.map.baidu.com/geodata/v3/poi/update'


@celery.task(name='send_email')
def send_email(msg):
    mail.send(msg)


@celery.task(name='send_sms')
def send_sms(url):
    response = requests.get(url)
    print(response.content)


@celery.task(name='distributor_geo_coding')
def distributor_geo_coding(distributor_id, distributor_address_id):
    distributor = Distributor.query.get(distributor_id)
    distributor_address = DistributorAddress.query.get(distributor_address_id)
    url = geo_coding_url % distributor_address.precise_address()
    response = requests.get(url)
    response = json.loads(response.content.decode('utf8'))
    if response['status'] == 0:
        distributor_address.longitude = response['result']['location']['lng']
        distributor_address.latitude = response['result']['location']['lat']
        data = {
            'title': distributor.name,
            'address': distributor_address.precise_address(),
            'longitude': distributor_address.longitude,
            'latitude': distributor_address.latitude,
            'coord_type': 1,
            'geotable_id': '121763',
            'ak': 'sdp9qCbToS7E23nDRxaAAwbh',
            'distributor_id': distributor.id
        }
        if not distributor_address.poi_id:
            response = requests.post(create_poi_url, data=data)
            response = json.loads(response.content.decode('utf8'))
            distributor_address.poi_id = response['id']
        else:
            data['id'] = distributor_address.poi_id
            requests.post(update_poi_url, data=data)
        db.session.commit()
