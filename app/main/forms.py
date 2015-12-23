# -*- coding: utf-8 -*-
from flask import current_app
from flask.ext.login import current_user
from wtforms import StringField
from wtforms.validators import Length

from app import db
from app.constants import USER_FEEDBACK
from app.models import Feedback, User
from app.utils.forms import Form
from app.wmj_email import send_email


class FeedbackForm(Form):
    feedback = StringField(validators=[Length(10, 200, '请输入10到200个字符')])
    contact = StringField(validators=[Length(0, 30, '超过长度限制')])

    def add_feedback(self):
        if current_user.is_authenticated and current_user.id_prefix == 'u' and User.query.get(current_user.id):
            user_id = current_user.id
            mobile = current_user.mobile
        else:
            user_id = 0
            mobile = ''
        feedback = Feedback(feedback=self.feedback.data, contact=self.contact.data, user_id=user_id)
        db.session.add(feedback)
        db.session.commit()
        send_email(current_app.config['FEEDBACK_EMAILS'], '用户反馈', USER_FEEDBACK,
                   feedback=feedback.feedback, contact=feedback.contact, mobile=mobile)
