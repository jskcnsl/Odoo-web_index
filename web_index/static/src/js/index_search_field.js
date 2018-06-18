odoo.define('web_index.IndexSearchField',function (require){
    'use strict';

    var Model = require('web.DataModel');
    var Widget = require("web.Widget");
    var time = require('web.time');
    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;

    var SearchField = Widget.extend({
        className: 'o_index_search_field',
        events: {
            "click .search_input": function (event) {
                this.render_field_list();
                this.$(".search_list").show();
            },
            "click .ui-menu-item": function (event) {
                $(event.currentTarget).parents('.search_field_dialog').find("input").val(event.currentTarget.innerText);
                this.input = event.currentTarget.innerText;
                this.result = event.currentTarget.getAttribute("content-id");
                this.$(".modal-close").click();
                this.render_field_list();
                this.$(".search_list").hide();
            },
            "blur .search_input": function (event) {
                var self = this;
                setTimeout(function () {
                    if ($(event.currentTarget).val() === ''){
                        self.input = null;
                        self.result = null;
                    }
                    $(event.currentTarget).val(self.input);
                    self.render_field_list();
                    self.$(".search_list").hide();
                },200)
                // $(event.currentTarget.parentElement).find("ul").hide();
            },
            "change .char_input": function (event) {
                this.input = event.currentTarget.value;
                this.result = event.currentTarget.value;
            },
            "change .date_input": function (event) {
                this.input = event.currentTarget.value;
                this.result = event.currentTarget.value;
            },
            "change .selection_input": function (event) {
                this.input = event.currentTarget.selectedOptions[0].text;
                this.result = event.currentTarget.value;
            },
            "click .ui-menu-more": function (event) {
                var model = new Model(this.options.model);
                var search_domain = this.get_search_domain();
                var self = this;
                model.call("name_search", [], {
                    name: this.$(".search_input").val(),
                    args: search_domain,
                    operator: 'ilike',
                    limit: 99999,
                    context: this.options.cxt
                }).then(function (result) {
                    self.$(".search_modal").html(QWeb.render("web_index.search_field_modal", {
                        contents: result
                    }))
                })
            }
        },
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            this.options = options;
            this.options.domain = this.options.domain || [];
            this.name = this.options.name || "-";
            this.input = null;
            this.result = null;
            this.render();
        },
        render: function () {
            var self = this;
            if (this.options.type === 'field'){
                this.$el.html(QWeb.render('web_index.index_search_field', self.options));
                this.$('.search_input').bind('input propertychange', function () {
                    self.render_field_list();
                });
                // this.render_field_list();
            } else if (this.options.type === 'date'){
                this.$el.html(QWeb.render('web_index.index_search_field', self.options));
                var l10n = _t.database.parameters;
                var datepickers_options = {
                    startDate: moment({y: 1900}),
                    endDate: moment().add(200, "y"),
                    calendarWeeks: true,
                    icons: {
                        time: 'fa fa-clock-o',
                        date: 'fa fa-calendar',
                        up: 'fa fa-chevron-up',
                        down: 'fa fa-chevron-down'
                    },
                    language: moment.locale(),
                    pickTime: false,
                    // format: time.strftime_to_moment_format(l10n.date_format)
                };
                this.$('input.date_input').datetimepicker(datepickers_options);
            } else if (this.options.type === 'char'){
                this.$el.html(QWeb.render('web_index.index_search_field', self.options));
            } else if (this.options.type === 'selection'){
                this.$el.html(QWeb.render('web_index.index_search_field', {
                    name: self.options.name,
                    select_list: self.options.selection_list,
                    type: 'selection'}));
            }
        },
        render_field_list: function () {
            var search_domain = this.get_search_domain();
            var self = this;
            var model = new Model(this.options.model);
            model.call("name_search", [], {
                name: this.$(".search_input").val(),
                args: search_domain,
                operator: 'ilike',
                limit: 6,
                context: this.options.cxt
            }).then(function (result) {
                var more_info = false;
                if (result.length > 5)
                    more_info = true;
                self.$(".search_list").html(QWeb.render('web_index.search_field_list', {
                    'contents': result, 'more_info': more_info, 'tag': self.options.tag
                }));
            });
        },
        get_search_domain: function() {
            var search_domain = [];
            $.extend(true, search_domain, this.options.domain);
            var self = this;
            _.each(search_domain, function (domain) {
                if (domain.length === 3){
                    if (typeof domain[2] === 'string' && domain[2].startsWith('$')){
                        var fieldToFind = domain[2].replace('$', '');
                        var fieldResult = self.action_manager.fields[fieldToFind].result;
                        if (self.action_manager.fields[fieldToFind].options.type === 'field'){
                            fieldResult = parseInt(fieldResult);
                        }
                        domain[2] = fieldResult;
                    }
                }
            });
            return search_domain;
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            // this._super.apply(this, arguments);
        }
    });
    return SearchField;
});