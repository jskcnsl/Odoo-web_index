odoo.define('web_index.IndexWidget',function (require){
    'use strict';
    var IndexHeaderWindow = require("web_index.IndexHeaderWindow");
    var IndexHtmlWindow = require("web_index.IndexHtmlWindow");
    var IndexNoticeWindow = require("web_index.IndexNoticeWindow");
    var IndexListWindow = require("web_index.IndexListWindow");
    var IndexPivotWindow = require("web_index.IndexPivotWindow");
    var IndexValueWindow = require("web_index.IndexValueWindow");
    var IndexSearchWindow = require("web_index.IndexSearchWindow");
    var IndexChartWindow = require("web_index.IndexChartWindow");
    var IndexValueSetWindow = require("web_index.IndexValueSetWindow");
    var IndexDownloadWindow = require("web_index.IndexDownloadWindow");

    var ControlPanelMixin = require('web.ControlPanelMixin');
    var Model = require('web.DataModel');
    var ajax = require('web.ajax');
    var Widget = require("web.Widget");
    var formats = require('web.formats');
    var time = require('web.time');
    var core = require("web.core");
    var data = require('web.data');
    var data_manager = require('web.data_manager');
    var pyeval = require('web.pyeval');
    var SearchView = require('web.SearchView');
    var session = require('web.session');

    var _t = core._t;
    var Spinner = window.Spinner;
    var QWeb = core.qweb;

    var IndexWidget = Widget.extend(ControlPanelMixin, {
        template: 'index_widget_view',

        events: {
        },

        init: function (parent, action, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            this.action = action;
            // this.dataset = new data.DataSetSearch(this, 'account.move.line');
            this.options = options || {};
            this.search_map = {};
            this.domain = [];
            this.wins = [];
        },
        start: function(){
            this.$(".content-wrap").html(QWeb.render(this.action.params.template, {}));
            var self = this;
            var def = _.each(this.action.params.win, function (win) {
                var obj;
                if (win.type === 'notice'){
                    obj = new IndexNoticeWindow(self, {win: win});
                } else if (win.type === 'header') {
                    obj = new IndexHeaderWindow(self, {win: win});
                    if (win.can_filter){
                        if (self.search_map[win.filter_tag]){
                            self.search_map[win.filter_tag].obj.push(obj);
                        } else {
                            self.search_map[win.filter_tag] = {obj: [obj], filter_win: null};
                        }
                    } else {
                        obj.render({});
                    }
                } else if (win.type === 'html') {
                    obj = new IndexHtmlWindow(self, {win: win});
                    if (win.can_filter){
                        if (self.search_map[win.filter_tag]){
                            self.search_map[win.filter_tag].obj.push(obj);
                        } else {
                            self.search_map[win.filter_tag] = {obj: [obj], filter_win: null};
                        }
                    } else {
                        obj.render({});
                    }
                } else if (win.type === 'download') {
                    obj = new IndexDownloadWindow(self, {win: win});
                    if (win.can_filter){
                        if (self.search_map[win.filter_tag]){
                            self.search_map[win.filter_tag].obj.push(obj);
                        } else {
                            self.search_map[win.filter_tag] = {obj: [obj], filter_win: null};
                        }
                    } else {
                        obj.render({});
                    }
                } else if (win.type === 'list') {
                    obj = new IndexListWindow(self, {win: win});
                    if (win.can_filter){
                        if (self.search_map[win.filter_tag]){
                            self.search_map[win.filter_tag].obj.push(obj);
                        } else {
                            self.search_map[win.filter_tag] = {obj: [obj], filter_win: null};
                        }
                    } else {
                        obj.render({});
                    }
                }else if (win.type === 'pivot') {
                    obj = new IndexPivotWindow(self, {win: win});
                    if (win.can_filter){
                        if (self.search_map[win.filter_tag]){
                            self.search_map[win.filter_tag].obj.push(obj);
                        } else {
                            self.search_map[win.filter_tag] = {obj: [obj], filter_win: null};
                        }
                    } else {
                        obj.render({});
                    }
                } else if (win.type === 'chart') {
                    obj = new IndexChartWindow(self, {win: win});
                    if (win.can_filter){
                        if (self.search_map[win.filter_tag]){
                            self.search_map[win.filter_tag].obj.push(obj);
                        } else {
                            self.search_map[win.filter_tag] = {obj: [obj], filter_win: null};
                        }
                    } else {
                        obj.render({});
                    }
                } else if (win.type === 'set') {
                    obj = new IndexValueSetWindow(self, {win: win});
                    if (win.can_filter){
                        if (self.search_map[win.filter_tag]){
                            self.search_map[win.filter_tag].obj.push(obj);
                        } else {
                            self.search_map[win.filter_tag] = {obj: [obj], filter_win: null};
                        }
                    } else {
                        obj.render({});
                    }
                } else if (win.type === 'value') {
                    obj = new IndexValueWindow(self, {win: win});
                } else if (win.type === 'search') {
                    obj = new IndexSearchWindow(self, {win: win});
                    if (self.search_map[win.tag]){
                        self.search_map[win.tag].filter_win = obj;
                    } else {
                        self.search_map[win.tag] = {obj: [], filter_win: obj};
                    }
                }
                self.$('.' + win['aim_class']).html(obj.$el);
                self.wins.push(obj);
            });
            return $.when(def).then(this.anything_change.bind(this)).then(function () {

            });
        },
        render_from_tag: function (tag) {
            var self = this;
            var funclist = [];
            if (tag != undefined){
                _.each(this.search_map[tag].obj, function (obj) {
                    funclist.push(new Promise(function (resolve, reject) {
                        obj.render(self.search_map[tag].filter_win.result);
                        self.$('.' + obj.options.win.aim_class).html(obj.$el);
                        resolve("success");
                    }));
                });
            }
            var p = Promise.all(funclist).then(function (res) {
                $.unblockUI();
            }).catch(function (r) {
                console.log("err");
                console.log(r);
            });
        },
        parse_client: function (v) {
            if (v)
                return formats.parse_value(v, {"widget": 'date'});
            else
                return false;
        },
        format_client: function (v) {
            if (v)
                return formats.format_value(v, {"widget": 'date'});
            else
                return false;
        },
        anything_change: function () {
            var self = this;
            var title = self.action.name;

            self.set("title", title);
            // self.$buttons
            //     .find('.o_account_book_print_button')
            //     .toggle(true);
            self.update_cp();
            self.action_manager.do_push_state({
                action: self.action.id
            });
        },
        on_search: function (domains) {
            // 搜索框调用方法 暂无用
            var result = pyeval.sync_eval_domains_and_contexts({
                domains: domains
            });
            this.domain = result.domain;
            // this.fetch_and_render_thread();
        },
        update_cp: function () {
            this.update_control_panel({
                breadcrumbs: this.action_manager.get_breadcrumbs(),
                cp_content: {
                    // $buttons: this.$buttons
                }
            });
        },
        do_show: function () {
            this._super.apply(this, arguments);
            this.update_cp();
            this.action_manager.do_push_state({
                action: this.action.id
            });
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            this._super.apply(this, arguments);
        }
    });

    core.action_registry.add("web_index.index_widget", IndexWidget);

});