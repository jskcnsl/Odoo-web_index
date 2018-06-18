odoo.define('web_index.IndexHeaderWindow',function (require){
    'use strict';

    var Model = require('web.DataModel');
    var Widget = require("web.Widget");
    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;

    var HeaderWindow = Widget.extend({
        className: 'o_index_header_window',
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            this.options = options || {};
        },
        render: function (data) {
            this.$el.html(QWeb.render('web_index.index_header_window_view', {header_title: this.options.win.header_title}));
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            // this._super.apply(this, arguments);
        }
    });
    return HeaderWindow;
});