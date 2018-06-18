odoo.define('web_index.IndexPivotWindow',function (require){
    'use strict';

    var Model = require('web.DataModel');
    var Widget = require("web.Widget");
    var core = require("web.core");
    var QWeb = core.qweb;
    var _t = core._t;

    var opt_value = {'+': 0, '-': 0, '*': 5, '/': 5, ')': -5, '(': -5};

    var PivotWindow = Widget.extend({
        className: 'o_index_pivot_window',
        init: function (parent, options) {
            this._super.apply(this, arguments);
            this.action_manager = parent;
            this.options = options || {};
        },
        render: function (data) {
            this.$el.html(QWeb.render('web_index.index_pivot_window_view'));
            var sumNumAndPrintString = $.pivotUtilities.aggregatorTemplates.sumNumAndPrintString;
            var numberFormat = $.pivotUtilities.numberFormat;
            var intFormat = numberFormat({digitsAfterDecimal: 2});
            var pivotModel = new Model(this.options.win.model);
            var self = this;
            pivotModel.call(this.options.win.func, [[], data]).then(function (result) {
                var derivedAttributes = {};
                for (var key in result.nameDict) {
                    const mykey = key;
                    derivedAttributes[result.nameDict[key]["header"]] = function (record) {
                        if (result.nameDict[mykey].selection) {
                            return result.nameDict[mykey].selection[record[mykey]]
                        }
                        return record[mykey];
                    }
                }
                self.$(".pivot_single").pivot(
                    result.rawData,
                    {
                        rows: result.rows,
                        cols: result.cols,
                        showColTotal: self.options.win.showColTotal,
                        showRowTotal: self.options.win.showRowTotal,
                        fixedColHeader: self.options.win.fixedColHeader,
                        fixedRowHeader: self.options.win.fixedRowHeader,
                        aggregator: sumNumAndPrintString(intFormat)(["value"]),//sum(intFormat)(["value"])
                        rendererName: "Table",
                        rendererOptions: {
                            table: {
                                renderCell: function () {//自定义的渲染方法 filter筛选单元格，method是渲染方法
                                    var filters = [];
                                    _.each(result.filter, function (f) {
                                        filters.push({
                                            filter: f.filter,
                                            method: function (src, records, value, filters, rows, pivotData) {
                                                var opt_stock = [];var val_stock = [];var my_value = 0;var num = 0;var row = false;
                                                var m = f.m.replace(/\s+/g,"");
                                                _.each(m, function (word) {
                                                    if (isNaN(word)){
                                                        // 若有标记则将单元格元素值入栈，没有则以整数入栈
                                                        if (word !== "#"){
                                                            if (row)
                                                                val_stock.push(rows[num].value);
                                                            else
                                                                val_stock.push(num);
                                                            num = 0;
                                                        }
                                                        // 清楚标记
                                                        row = false;
                                                        if (word === '#'){
                                                            // 若新字符串为 # 表示接下来的数字代表单元格元素
                                                            row = true;
                                                        } else if (word in opt_value){
                                                            // 若将入栈的运算符优先级低，则将前方运算
                                                            while (opt_stock.length > 0 && opt_value[word] <= opt_value[opt_stock[opt_stock.length - 1]]){
                                                                var opt = opt_stock.pop();
                                                                var num1 = val_stock.pop();
                                                                var num2 = val_stock.pop();
                                                                if (opt === '+')
                                                                    val_stock.push(num1 + num2);
                                                                else if (opt === '-')
                                                                    val_stock.push(num2 - num1);
                                                                else if (opt === '*')
                                                                    val_stock.push(num1 * num2);
                                                                else if (opt === '/')
                                                                    val_stock.push(num2 / num1);
                                                            }
                                                            opt_stock.push(word);
                                                        }
                                                    } else {
                                                        num = num * 10 + parseInt(word);
                                                    }
                                                });
                                                if (row)
                                                    val_stock.push(rows[num].value);
                                                else
                                                    val_stock.push(num);
                                                while (opt_stock.length > 0){
                                                    var opt = opt_stock.pop();
                                                    var num1 = val_stock.pop();
                                                    var num2 = val_stock.pop();
                                                    if (opt === '+')
                                                        val_stock.push(num1 + num2);
                                                    else if (opt === '-')
                                                        val_stock.push(num2 - num1);
                                                    else if (opt === '*')
                                                        val_stock.push(num1 * num2);
                                                    else if (opt === '/')
                                                        val_stock.push(num2 / num1);
                                                }
                                                pivotData.setColValue(src, val_stock.pop());
                                                // var a = 1;
                                                return src;
                                            }
                                        });
                                    });
                                    return filters;
                                },
                                // clickCallback: function (e, value, filters, pivotData) {
                                //     var names = [];
                                //     pivotData.forEachMatchingRecord(filters,
                                //         function (record) {
                                //             names.push(record.value);
                                //         });
                                //     alert(names.join("\n"));
                                // }
                            }
                        },
                        derivedAttributes: derivedAttributes
                    }, "zh"
                );
                self.$(".pivot_download_button").click(function (e) {
                    // alert("a");
                    self.$(".pivot_single").pivotTable2Excel("交叉表.xls", "mySheet");
                });
            });
        },
        destroy: function () {
            // this.$buttons.off().destroy();
            // this._super.apply(this, arguments);
        }
    });
    return PivotWindow;
});