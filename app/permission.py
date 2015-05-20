# -*-coding: utf-8 -*-
from flask.ext.principal import RoleNeed, Permission, identity_loaded


_user_role = RoleNeed('user')
user_id_prefix = u'u'
user_permission = Permission(_user_role)

_vendor_role = RoleNeed('vendor')
vendor_id_prefix = u'p'
vendor_permission = Permission(_vendor_role)

_dealer_role = RoleNeed('dealer')
dealer_id_prefix = u'd'
dealer_permission = Permission(_dealer_role)

_admin_role = RoleNeed('admin')
admin_id_prefix = u'a'
admin_permission = Permission(_admin_role)


def identity_config(app):
    @identity_loaded.connect_via(app)
    def on_identity_loaded(sender, identity):
        if identity.id:
            if identity.id.startswith(user_id_prefix):
                identity.provides.add(_user_role)
            elif identity.id.startswith(vendor_id_prefix):
                identity.provides.add(_vendor_role)
            elif identity.id.startswith(dealer_id_prefix):
                identity.provides.add(_dealer_role)
            elif identity.id.startswith(admin_id_prefix):
                identity.provides.add(_admin_role)