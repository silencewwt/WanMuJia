# -*- coding: utf-8 -*-
from wtforms.fields import SelectField as BaseSelectField, SelectMultipleField as BaseSelectMultipleField,\
    IntegerField as BaseIntegerField
from wtforms.validators import ValidationError
from wtforms.widgets import HTMLString, html_params, Select as BaseSelect
from html import escape


class Select(BaseSelect):
    def __call__(self, field, **kwargs):
        kwargs.setdefault('id', field.id)
        if self.multiple:
            kwargs['multiple'] = True
        html = ['<select %s><option></option>' % html_params(name=field.name, **kwargs)]    # 后台模板的选择器需要...
        for val, label, selected in field.iter_choices():
            html.append(self.render_option(val, label, selected))
        html.append('</select>')
        return HTMLString(''.join(html))


class SelectField(BaseSelectField):
    widget = Select()


class SelectNotRequiredField(BaseSelectField):
    widget = Select()

    def process_formdata(self, valuelist):
        if valuelist:
            try:
                self.data = self.coerce(valuelist[0])
            except ValueError:
                self.data = 0

    def pre_validate(self, form):
        if self.data:
            for v, _ in self.choices:
                if self.data == v:
                    break
            else:
                raise ValueError(self.gettext('Not a valid choice'))


class SelectNotRequiredMultipleField(BaseSelectMultipleField):
    def process_formdata(self, valuelist):
        try:
            self.data = list(self.coerce(x) for x in valuelist)
        except (ValueError, TypeError):
            if len(valuelist) == 1 and (valuelist[0] == '' or valuelist[0] is None):
                self.data = []
            else:
                raise ValueError(self.gettext('Invalid choice(s): one or more data inputs could not be coerced'))


class OptionGroupSelectWidget(Select):
    """
    Add support of choices with ``optgroup`` to the ``Select`` widget.
    """
    @classmethod
    def render_option(cls, value, label, mixed, **kwargs):
        """
        Render option as HTML tag, but not forget to wrap options into
        ``optgroup`` tag if ``label`` var is ``list`` or ``tuple``.
        """
        if isinstance(label, (list, tuple)):
            children = []

            for item_value, item_label in label:
                item_html = cls.render_option(item_value, item_label, mixed)
                children.append(item_html)

            html = u'<optgroup label="%s">%s</optgroup>'
            data = (escape(value), u'\n'.join(children))
        else:
            coerce_func, data = mixed
            selected = coerce_func(value) == data

            options = {'value': value}

            if selected:
                options['selected'] = u'selected'

            html = u'<option %s>%s</option>'
            data = (html_params(**options), escape(label))

        return HTMLString(html % data)


class OptionGroupSelectField(SelectField):
    """
    Add support of ``optgroup``'s' to default WTForms' ``SelectField`` class.

    So, next choices would be supported as well::

        (
            ('Fruits',
                (
                    ('apple', 'Apple'),
                    ('peach', 'Peach'),
                    ('pear', 'Pear')
                )
            ),
            ('Vegetables', (
                ('cucumber', 'Cucumber'),
                ('potato', 'Potato'),
                ('tomato', 'Tomato'),
            ))
        )

    """
    widget = OptionGroupSelectWidget()

    def iter_choices(self):
        """
        We should update how choices are iter to make sure that value from
        internal list or tuple should be selected.
        """
        for value, label in self.choices:
            yield (value, label, (self.coerce, self.data))

    def pre_validate(self, form, choices=None):
        """
        Don't forget to validate also values from embedded lists.
        """
        default_choices = choices is None
        choices = choices or self.choices

        for value, label in choices:
            found = False

            if isinstance(label, (list, tuple)):
                found = self.pre_validate(form, label)

            if found or value == self.data:
                return True

        if not default_choices:
            return False

        raise ValidationError(self.gettext(u'Not a valid choice'))


class IntegerField(BaseIntegerField):
    def process_formdata(self, valuelist):
        if valuelist:
            try:
                self.data = int(valuelist[0])
            except ValueError:
                self.data = None
                raise ValueError('')
