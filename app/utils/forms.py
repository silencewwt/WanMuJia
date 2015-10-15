# -*- coding: utf-8 -*-
from flask.ext.wtf import Form as BaseForm


class Form(BaseForm):
    def error2str(self):
        errors = []
        for key in self.errors:
            for error in self.errors[key]:
                if error:
                    errors.append(error)
        return u', '.join(errors)
