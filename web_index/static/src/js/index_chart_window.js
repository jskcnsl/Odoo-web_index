odoo.define('web_index.IndexChartWindow',function (require){
    'use strict';

    var Model = require('web.DataModel');
    var Widget = require("web.Widget");
    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;

    var ChartWindow = Widget.extend({
        className: 'o_index_chart_window',
        // event: {
        //
        // },
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            this.options = options || {};
            this.chart = [];
            this.data = null;
            this.chart_data = [];
        },
        render: function (data) {
            this.template_reset();
            this.chart_data = [];
            var classlist = [];
            var funclist = [];
            this.$el.html(QWeb.render('web_index.index_chart_window_view', {chart_div_id: this.options.win.aim_class}));
            var self = this;
            // 配置样例chart
            // 配置标题
            this.chart_data_example.title = this.options.win.chart_title;
            // 配置副标题
            this.chart_data_example.subtitle = this.options.win.chart_subtitle;
            // 配置X轴
            if (this.options.win.xAxis_type === 'func'){
                this.chart_data_example.xAxis = {type: 'category'};
                funclist.push(new Promise(function (resolve, reject) {
                    var chartModel = new Model(self.options.win.xAxis_model);
                    chartModel.call(self.options.win.xAxis_func, [[], data]).then(function (result) {
                        self.chart_data_example.xAxis.categories = result;
                        resolve("success");
                    });
                }));
            }
            else if (this.options.win.xAxis_type !== 'none'){
                this.chart_data_example.xAxis = {type: this.options.win.xAxis_type};
                if (this.options.win.xAxis_type === 'category'){
                    this.chart_data_example.xAxis.categories = this.options.win.xAxis_cate;
                }
            }
            // 配置Y轴
            if (this.options.win.yAxis !== undefined){
                this.chart_data_example.yAxis = [];
                for(var i = 0; i < this.options.win.yAxis.length; i++){
                    this.chart_data_example.yAxis.push({
                        min: this.options.win.yAxis[i].min,
                        title: {
                            text: this.options.win.yAxis[i].name
                        },
                        opposite: this.options.win.yAxis[i].opposite
                    });
                }
            }
            // 获取各表部分信息
            if (this.options.win.chart_list){
                var getModel = new Model(this.options.win.model);
                funclist.push(new Promise(function (resolve, reject) {
                    getModel.call(self.options.win.func, [[], data]).then(function (result) {
                        _.each(result, function (r) {
                            classlist.push(r.aim_class);
                            var temp_chart_data = {};
                            $.extend(true, temp_chart_data, self.chart_data_example);
                            temp_chart_data.title = r.title;
                            temp_chart_data.subtitle = r.subtitle;
                            self.chart_data.push(temp_chart_data);
                        });
                        resolve("success");
                    });
                }));
            } else {
                classlist.push(this.options.win.aim_class);
                var temp_chart_data = self.chart_data_example;
                self.chart_data.push(temp_chart_data);
            }
            // 拼接图表
            Promise.all(funclist).then(function (res) {
                funclist = [];
                _.each(classlist, function (chart_class) {
                    $('<div class="chart_single" id="' + chart_class +'"/>').appendTo(self.$el.find(".chart"));
                });
                _.each(self.options.win.charts, function(chart) {
                    var chartModel = new Model(chart.model);
                    funclist.push(new Promise(function (resolve, reject) {
                        chartModel.call(chart.func, [[], data]).then(function (result) {
                            for (var i = 0; i < self.chart_data.length; i++){
                                var series_data = {};
                                if (chart.type === 'column') {
                                    series_data = {
                                        type: chart.type,
                                        grouping: chart.grouping,
                                        color: chart.color,
                                        pointPadding: chart.pointPadding,
                                        pointPlacement: chart.pointPlacement,
                                        name: result[i].name,
                                        data: result[i].data,
                                        yAxis: chart.yAxis
                                    };
                                } else if (chart.type === 'pie' || chart.type === 'variablepie') {
                                    series_data = {
                                        type: chart.type,
                                        size: chart.size,
                                        innerSize: chart.innerSize,
                                        startAngle: chart.startAngle,
                                        endAngle: chart.endAngle,
                                        zMin: chart.zMin,
                                        center: chart.center,
                                        name: result[i].name,
                                        data: result[i].data
                                    };
                                    if (chart.click_call_title_change) {
                                        series_data.point = {
                                            events: {
                                                click: function (e) {
                                                    e.point.series.chart.setTitle({
                                                        text: e.point.name + '\t' + e.point.percentage.toFixed(2) + ' %'
                                                    });
                                                }
                                            }
                                        }
                                    }
                                } else if (chart.type === 'spline') {
                                    series_data = {
                                        type: chart.type,
                                        name: result[i].name,
                                        data: result[i].data,
                                        yAxis: chart.yAxis
                                    };
                                }
                                if (result[i].valueSuffix !== undefined){
                                    self.chart_data[i]['plotOptions'][chart.type].tooltip = {
                                        valueSuffix: result[i].valueSuffix
                                    };
                                }
                                self.chart_data[i].series.push(series_data)
                            }
                            resolve("success");
                        });
                    }));
                });
                Promise.all(funclist).then(function (res) {
                    var i = 0;
                    for (i = 0; i < self.chart_data.length; i++) {
                        self.chart.push(Highcharts.chart(classlist[i], self.chart_data[i]));
                    }
                });
            });
        },
        template_reset: function() {
            this.chart_data_example = {
                chart: {
                    height: 375,
                    zoomType: 'x'
                },
                title: {
                    text: ""
                },
                subtitle: {
                    text: ""
                },
                plotOptions: {
                    column: {
                        shadow: false,
                        borderWidth: 0
                    },
                    spline: {
                        marker: {
                            radius: 4,
                            lineColor: '#666666',
                            lineWidth: 1
                        }
                    },
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer'
                    },
                    variablepie: {
                        allowPointSelect: true,
                        cursor: 'pointer'
                    }
                },
                series: []
            };
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            // this._super.apply(this, arguments);
        }
    });
    return ChartWindow;
});