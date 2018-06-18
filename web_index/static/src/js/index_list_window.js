odoo.define('web_index.IndexListWindow',function (require){
    'use strict';

    var Model = require('web.DataModel');
    var Widget = require("web.Widget");
    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;

    var ListWindow = Widget.extend({
        className: 'o_index_list_window',
        // event: {
        //
        // },
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            // this.action = action;
            // this.dataset = new data.DataSetSearch(this, 'account.move.line');
            this.page_no = 1;
            this.page_max = 0;
            this.page_line = [];
            this.options = options || {};
            this.pre_page = this.options.win.pre_page;
        },
        render: function (data) {
            var listModel = new Model(this.options.win.model);
            this.page_max = 0;
            var self = this;
            listModel.call(this.options.win.func, [[], data]).then(function (content) {
                var page_content = [];
                var page = [];
                for (var i = 0; i < content.window_content.length; i++) {
                    page.push(content.window_content[i]);
                    // 最后一个或页已满则推入
                    if (i + 1 === content.window_content.length || page.length === self.pre_page) {
                        self.page_max++;
                        page_content.push(page);
                        page = [];
                    }
                }
                content.window_content = page_content;
                self.$el.html(QWeb.render('web_index.index_list_window_view', content));
                self.render_page_no();
                var nself = self;
                if (self.options.win.action_func) {
                    self.$(".click-line").on("click", function (e) {
                        $.blockUI();
                        var click_id = e.currentTarget.getAttribute("item-id");
                        var listModel = new Model(nself.options.win.model);
                        listModel.call(self.options.win.action_func, [[], click_id]).then(function (result) {
                            nself.action_manager.do_action(result).then(function (r) {
                                $.unblockUI();
                            });
                        });
                    });
                }
            });

        },
        render_page_no: function () {
            $('.' + this.options.win.aim_class + ' tbody').hide();
            $('.' + this.options.win.aim_class + ' tbody.win_page-' + this.page_no).show();
            var page_no_selector = $('.' + this.options.win.aim_class + " .page_no_position");
            if (this.page_max <= 1){
                page_no_selector.html("");
                return;
            }
            this.page_line = [];
            if (this.page_max <= 5){
                for (var i = 1; i <= this.page_max; i++) {
                    this.page_line.push(i);
                }
            } else if (this.page_no <= 3) {
                this.page_line = [1, 2, 3, 4, this.page_max];
            } else if (this.page_no + 2 <= this.page_max){
                this.page_line = [this.page_no - 2, this.page_no - 1, this.page_no, this.page_no + 1, this.page_no + 2];
            } else {
                this.page_line = [this.page_max - 4, this.page_max - 3, this.page_max - 2, this.page_max - 1, this.page_max]
            }

            page_no_selector.html(QWeb.render('web_index.page_no_widget', {page_line: this.page_line}));
            var self = this;
            $('.' + this.options.win.aim_class + " .page_no_position .pre").on('click', function (event) {
                if (self.page_no > 1){
                    self.page_no --;
                    self.render_page_no();
                }
            });
            $('.' + this.options.win.aim_class + " .page_no_position .nxt").on('click', function (event) {
                if (self.page_no < self.page_max){
                    self.page_no ++;
                    self.render_page_no();
                }
            });
            $('.' + this.options.win.aim_class + " .page_no_position .pgn").on('click', function (event) {
                self.page_no = parseInt(event.currentTarget.getAttribute("pgn"));
                self.render_page_no();
            });
            $('.' + this.options.win.aim_class + " .pgn-" + self.page_no).addClass('pagination-focus');
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            // this._super.apply(this, arguments);
        }
    });
    return ListWindow;
});