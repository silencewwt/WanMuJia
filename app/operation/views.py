# -*- coding: utf-8 -*-
import datetime
from math import ceil

from flask import redirect, render_template, url_for, request

from app.models import GuideSMS
from app.permission import privilege_permission
from app.privilege.forms import LoginForm
from . import operation


@operation.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit() and form.login():
        return redirect(url_for('operation.index'))
    return render_template('operation/login.html')


@operation.route('/')
@privilege_permission.require(404)
def index():
    page = request.args.get('page', 1, type=int)
    sms_records = GuideSMS.query.order_by(GuideSMS.created).paginate(page, 50, False).items
    pages = ceil(GuideSMS.query.count() / 50.0)
    records = []
    for sms_record in sms_records:
        records.append({
            'item': sms_record.item.item,
            'brand': sms_record.item.vendor.brand,
            'distributor': sms_record.distributor.name,
            'distributor_address': sms_record.distributor.address.precise_address(),
            'distributor_telephone': sms_record.distributor.contact_telephone,
            'distributor_mobile': sms_record.distributor.contact_mobile,
            'mobile': sms_record.mobile,
            'created': datetime.datetime.fromtimestamp(sms_record.created).strftime('%F %T'),
            'item_url': url_for('item.detail', item_id=sms_record.item.id)
        })
    return render_template('operation/index.html', records=records, pages=pages)
