odoo.define('web_index.IndexHtmlWindow',function (require){
    'use strict';

    var Model = require('web.DataModel');
    var Widget = require("web.Widget");
    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;

    var HtmlWindow = Widget.extend({
        className: 'o_index_html_window',
        events: {
            // "click .download_btn": function (e) {
            //     if (this.excel_file === null){
            //         alert("文件未缓存完成");
            //     } else {
            //         var self = this;
            //         var uri = 'data:application/x-xls;base64,';
            //         var $btn = $("<a name='excelDownloadBtn' style='display:none;'>下载</a>");
            //         $btn.attr('download', this.excel_file_name);
            //
            //         var blob = getBlob(uri + this.base64(this.excel_file));
            //         $btn.attr('href', URL.createObjectURL(blob));
            //         $btn.appendTo(self);
            //         $btn[0].click();
            //         $btn.remove();
            //     }
            // }
        },
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            this.options = options || {};
        },
        render: function (data) {
            this.$el.html(QWeb.render('web_index.index_html_window_view'));
            var excelModel = new Model(this.options.win.model);
            var self = this;
            excelModel.call(this.options.win.func, [[], data]).then(function (result) {
                self.$(".excel-body").html(result);
            });
            // excelModel.call(this.options.win.file_func, [[], data]).then(function (result) {
            //     var uri = 'data:application/x-xls;base64,';
            //     var $btn = $("#excelDownloadBtn");
            //     $btn.attr('download', result['name']);
            //     $btn.attr('href', uri +  result['data']);
            // });
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            // this._super.apply(this, arguments);
        },
        base64: function (s) {
            return window.btoa(unescape(encodeURIComponent(s)));
        }
    });
    return HtmlWindow;
});