odoo.define('web_index.IndexNoticeWindow',function (require){
    'use strict';

    var Model = require('web.DataModel');
    var Widget = require("web.Widget");
    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;

    var NoticeWindow = Widget.extend({
        className: 'o_index_notice_window',
        // event: {
        //
        // },
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            // this.action = action;
            // this.dataset = new data.DataSetSearch(this, 'account.move.line');
            this.options = options || {win: {model: 'res.notice',
                    func: 'get_win_content', click: "dialog", color: "primary"}};
            var noticeModel = new Model(this.options.win.model);
            var self = this;
            noticeModel.call(this.options.win.func, [[]]).then(function (result) {
                self.render(result);
            });
        },
        render: function (content) {
            content.click = this.options.win.click;
            this.$el.html(QWeb.render('web_index.index_notice_window_view', content));
            // 替换标题颜色
            if (this.options.win.color === 'danger'){
                this.$("div.panel.panel-primary").removeClass("panel-primary").addClass("panel-danger");
            }
            var self = this;
            // 确定点击跳转方式
            if (this.options.win.click === "dialog"){
                // 为弹出对话框写入html内容
                _.each(content['window_content'], function (c) {
                    self.$("#dialog" + c['id'] + " .modal-body-content").html(c['dialog_content']);
                });
            } else if (this.options.win.click === 'action'){
                this.$(".list-group-item").on("click", function (e) {
                    $.blockUI();
                    var click_id = parseInt(e.currentTarget.getAttribute("item-id"));
                    var noticeModel = new Model(self.options.win.model);
                    noticeModel.call('goto_action', [[], click_id]).then(function (result) {
                        self.action_manager.do_action(result).then(function (r) {
                            $.unblockUI();
                        });
                    });
                });
            }
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            // this._super.apply(this, arguments);
        }
    });
    return NoticeWindow;
});