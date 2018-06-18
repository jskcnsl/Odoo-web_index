odoo.define('web_index.IndexDownloadWindow',function (require){
    'use strict';

    var Model = require('web.DataModel');
    var Widget = require("web.Widget");
    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;

    var DownloadWindow = Widget.extend({
        className: 'o_index_download_window',
        events: {
            "click .download-button": function (e) {
                alert('1');
                window.open('/web_index/download/' + this.options.win.model + '/' + this.options.win.func + '?data=' + data.toJSON());
            }
        },
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            this.options = options || {};
            this.data = {};
        },
        render: function (data) {
            this.data = data;
            this.$el.html(QWeb.render('web_index.index_download_window_view', {
                title: this.options.win.download_title,
                download_href: '/web_index/download/' + this.options.win.model + '/' + this.options.win.func + '?data=' + JSON.stringify(data)}));
            var self = this;
            self.$("#download_button").on("click", function (e) {
                alert('2');
                window.open('/web_index/download/' + self.options.win.model + '/' + self.options.win.func);
            });
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            // this._super.apply(this, arguments);
        }
    });
    return DownloadWindow;
});