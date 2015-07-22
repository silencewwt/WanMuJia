# -*- coding: utf-8 -*-
import datetime


def date(timestamp):
    return datetime.datetime.fromtimestamp(timestamp).strftime('%F')
