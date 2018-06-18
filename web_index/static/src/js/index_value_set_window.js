odoo.define('web_index.IndexValueSetWindow',function (require){
    'use strict';

    var Model = require('web.DataModel');
    var Widget = require("web.Widget");
    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;

    var ValueSetWindow = Widget.extend({
        className: 'o_index_value_set_window',
        // event: {
        //
        // },
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            this.options = options || {};
        },
        render: function (data) {
            var listModel = new Model(this.options.win.model);
            var self = this;
            listModel.call(this.options.win.func, [[], data]).then(function (content) {
                self.$el.html(QWeb.render('web_index.index_value_set_window_view_' + self.options.win.direct,
                    {content: content, width: self.options.win.width}));
            });
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            // this._super.apply(this, arguments);
        }
    });
    return ValueSetWindow;
});