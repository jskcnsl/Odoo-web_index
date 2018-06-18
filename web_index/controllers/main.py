# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

import cStringIO
import io
import json
import logging
import time
import werkzeug.wrappers
from PIL import Image, ImageFont, ImageDraw

from odoo.http import request
from odoo import http, tools

logger = logging.getLogger(__name__)


class WebIndex(http.Controller):

    @http.route('/web_index/download/<string:m>/<string:f>', type='http', auth="user")
    def index_download(self, m, f, **kwargs):
        res = getattr(request.env[m], f)(json.loads(kwargs['data']))
        name = (u"attachment;filename=%s" % res['name']).encode("gb2312").decode("ISO8859-1")
        return request.make_response(res['data'], headers=[
            ('Content-Disposition', name),
            ('Content-Type', 'application/octet-stream')])
