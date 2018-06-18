odoo.define('web_index.IndexSearchWindow',function (require){
    'use strict';

    var SearchField = require('web_index.IndexSearchField');
    var Model = require('web.DataModel');
    var Widget = require("web.Widget");
    var Dialog = require('web.Dialog');
    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;

    var SearchWindow = Widget.extend({
        className: 'o_index_search_window',
        events: {
            "click .search_button": function (event) {
                $.blockUI();
                var self = this;
                var res = [];
                var result = {};
                _.each(this.fields_list, function (field_tag) {
                    var field = self.fields[field_tag];
                    res.push(field.name + ":" + (field.input ? field.input : "-"));
                    result[field.options.tag] = field.result;
                });
                var model = new Model(this.options.win.model);
                model.call(this.options.win.func, [[], result]).then(function (response) {
                    if (response['code'] !== 0){
                        $.unblockUI();
                        new Dialog(self, {
                            size: 'medium',
                            title: "Dris迪睿思 ",
                            subtitle: "错误",
                            $content: $('<div>').html(QWeb.render('CrashManager.warning', {error: {data: {message: response['warning'], title: '错误'}}}))
                        }).open();
                        // self.action_manager.do_warn('错误', response['warning']);

                    } else {
                        self.result = response['data'];
                        self.$(".search_result").html(res.join("&nbsp;&nbsp;&nbsp;&nbsp;"));
                        self.result_get = true;
                        self.action_manager.render_from_tag(self.options.win.tag);
                    }
                });
                // var res = [];
                // var self = this;
                // _.each(this.fields_list, function (field_tag) {
                //     var field = self.fields[field_tag];
                //     res.push(field.name + ":" + (field.input ? field.input : "-"));
                //     self.result[field.options.tag] = field.result;
                // });
                // this.$(".search_result").html(res.join("&nbsp;&nbsp;&nbsp;&nbsp;"));
                // this.result_get = true;
                // this.action_manager.render_from_tag(this.options.win.tag);
                // new Promise(function (resolve, reject) {
                //     self.action_manager.render_from_tag(self.options.win.tag).then(resolve("success"));
                // });
            }
        },
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            this.options = options;
            this.fields = {};
            this.fields_list = [];
            this.result_get = false;
            this.result = {};
            this.render();
        },
        render: function () {
            var self = this;
            this.$el.html(QWeb.render('web_index.index_search_window', {window_title: this.options.win.window_title}));
            _.each(this.options.win.fields, function (field) {
                var new_field = new SearchField(self, field);
                new_field.$el.appendTo(self.$(".search_fields_content"));
                self.fields_list.push(field.tag);
                self.fields[field.tag] = new_field;
            });
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            // this._super.apply(this, arguments);
        }
    });
    return SearchWindow;
});