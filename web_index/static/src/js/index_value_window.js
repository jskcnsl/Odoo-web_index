odoo.define('web_index.IndexValueWindow',function (require){
    'use strict';

    var Model = require('web.DataModel');
    var Widget = require("web.Widget");
    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;

    var ValueWindow = Widget.extend({
        className: 'o_index_value_window',
        // event: {
        //
        // },
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            // this.action = action;
            // this.dataset = new data.DataSetSearch(this, 'account.move.line');
            this.options = options || {};
            var noticeModel = new Model(this.options.win.model);
            var self = this;
            noticeModel.call(this.options.win.func, [[]]).then(function (result) {
                self.render(result);
            });
        },
        render: function (content) {
            content.icon_back = this.options.win.icon_back;
            content.icon = this.options.win.icon;
            this.$el.html(QWeb.render('web_index.index_value_window_view', content));
            var self = this;
            this.$(".panel-body").on("click", function (e) {
                $.blockUI();
                var valueModel = new Model(self.options.win.model);
                valueModel.call('goto_action', [[]]).then(function (result) {
                    self.action_manager.do_action(result).then(function (r) {
                        $.unblockUI();
                    });
                });
            })
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            // this._super.apply(this, arguments);
        }
    });
    return ValueWindow;
});