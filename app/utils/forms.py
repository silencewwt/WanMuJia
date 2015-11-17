# -*- coding: utf-8 -*-
from flask import request
from flask.ext.wtf import Form as BaseForm


class Form(BaseForm):
    def generate_csrf_token(self, csrf_context=None):
        csrf_token = super(Form, self).generate_csrf_token(csrf_context)
        request.csrf_token = csrf_token
        return csrf_token

    def error2str(self):
        errors = []
        for key in self.errors:
            for error in self.errors[key]:
                if error:
                    errors.append(error)
        return u', '.join(errors)
