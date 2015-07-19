# -*- coding: utf-8 -*-
import sys

PY3 = sys.version_info[0] == 3

if PY3:
    from io import BytesIO
    IO = BytesIO
else:
    from cStringIO import StringIO
    IO = StringIO
