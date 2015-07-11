# -*- coding: utf-8 -*-
from flask.ext.wtf import Form as BaseForm


class Form(BaseForm):
    def error2str(self):
        errors = []
        for key in self.errors:
            errors.extend(self.errors[key])
        return u', '.join(errors)
