# -*- coding: utf-8 -*-

{
    'name': 'Web Index',
    'category': 'Hidden',
    'description': """
""",
    'version': '2.0',
    'depends': ['web'],
    'data': [
        'views/web_index.xml',
        'views/web_index_view.xml',
    ],
    'qweb': [
        'static/src/xml/*.xml',
    ],
    'auto_install': True,
}
