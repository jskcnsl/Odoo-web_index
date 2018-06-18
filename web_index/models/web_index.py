# -*- coding: utf-8 -*-

from odoo import models, fields, api


class WebIndex(models.Model):
    _name = "web.index"

    name = fields.Char(string=u'名称', required=True)
    action = fields.Many2one('ir.actions.client', string=u'动作')
    windows = fields.One2many('web.index.window', 'index_id', string=u'窗口模块')
    parent_menu = fields.Many2one('ir.ui.menu', string=u'上级菜单')
    menu = fields.Many2one('ir.ui.menu', string=u'菜单')
    menu_seq = fields.Integer(string=u'菜单序号')
    menu_icon = fields.Char(string=u'菜单图标', default='web_index,static/description/icon.png ')
    template_id = fields.Char(string=u'Template Name', required=True)
    state = fields.Selection([("draft", "待生成"), ("confirmed", "已生成")], string=u'状态', default='draft')

    @api.multi
    def get_params(self):
        self.ensure_one()
        return "{'win':[" + self.windows.get_param() + "],'template':'%s'}" % self.template_id

    @api.multi
    def action_cancel(self):
        if self.action:
            self.action.unlink()
        if self.menu:
            self.menu.unlink()
        return self.write({"state": "draft"})

    @api.multi
    def confirm(self):
        self.action_cancel()
        self.action = self.env['ir.actions.client'].create({
            "name": self.name,
            "tag": "web_index.index_widget",
            "params": self.get_params()
        })
        self.menu = self.env['ir.ui.menu'].create({
            "name": self.name,
            "parent_id": self.parent_menu.id,
            "sequence": self.menu_seq,
            "web_icon": self.menu_icon,
            "action": ','.join(['ir.actions.client', str(self.action.id)])
        })
        return self.write({"state": "confirmed"})


class WebIndexWindow(models.Model):
    _name = "web.index.window"

    name = fields.Char(string=u'标题', required=True)
    index_id = fields.Many2one("web.index", string=u'主页')
    window_type = fields.Selection([("notice", "通知"), ("list", "列表"), ("pivot", "交叉表"), ("value", "数值"), ("chart", "图表"),
                                    ("search", "搜索"), ("set", "数值集"), ("header", "分组标题"), ("html", "HTML"),
                                    ("download", "文件下载")], string=u'类型',
                                   required=True)
    aim_class = fields.Char(string=u'目标div标签的类', required=True)
    chart_list = fields.Boolean(string=u'生成一组图表', default=False)
    model = fields.Char(string=u'资源获取对象')
    func = fields.Char(string=u'资源获取方法', default='get_win_content')
    # download
    download_title = fields.Char(string=u'下载框标题')
    # pivot
    showColTotal = fields.Boolean(string=u'显示列合计')
    showRowTotal = fields.Boolean(string=u'显示行合计')
    fixedColHeader = fields.Boolean(string=u'固定列表头')
    fixedRowHeader = fields.Boolean(string=u'固定行表头')
    # chart
    chart_title = fields.Char(string=u'图表标题')
    title_align = fields.Selection([("left", "左"), ("center", "中"), ("right", "右")], default='center',
                                   string=u'标题水平位置')
    title_vertical_align = fields.Selection([("top", "顶部"), ("middle", "中央"), ("bottom", "底部")], default='top',
                                            string=u'标题图垂直位置')
    title_y = fields.Float(string=u'标题下沉深度')
    chart_subtitle = fields.Char(string=u'图表二级标题')
    subtitle_align = fields.Selection([("left", "左"), ("center", "中"), ("right", "右")], default='center',
                                      string=u'二级标题水平位置')
    subtitle_vertical_align = fields.Selection([("top", "顶部"), ("middle", "中央"), ("bottom", "底部")], default='top',
                                               string=u'二级标题图垂直位置')
    subtitle_y = fields.Float(string=u'二级标题下沉深度')
    xAxis_type = fields.Selection([("linear", "线性轴"), ("logarithmic", "对数轴"), ("datetime", "时间轴"),
                                   ("category", "分类轴"), ("func", "动态获取"), ("none", "无X轴")], defalut='none',
                                  string=u'X轴类型')
    xAxis_model = fields.Char(string=u'X轴动态获取对象')
    xAxis_func = fields.Char(string=u'X轴动态获取方法')
    xAxis_cate = fields.One2many("web.index.chart.xaxis.category", "window_id", string=u'X轴分类')
    yAxis = fields.One2many("web.index.chart.yaxis", "window_id", string=u'Y轴')
    charts = fields.One2many("web.index.chart.single", "window_id", string=u'图标')
    # list
    pre_page = fields.Integer(string=u'默认每页条数')
    action_func = fields.Char(string=u'跳转动作获取函数')
    # notice
    color = fields.Selection([('primary', u'蓝色'), ('danger', u'红色')], default='primary', string=u'标题栏颜色')
    click = fields.Selection([('dialog', u'弹出对话框'), ('action', u'跳转动作')], string=u'内容展示方式', default='dialog',
                             help='弹出对话框:需要返回dialog_content参数,跳转动作:需要goto_action函数')
    # value
    icon_back = fields.Selection([("bg-default", u"白色"), ("bg-success", u"绿色"), ("bg-danger", u'红色')],
                                 string=u'图标颜色', default="bg-default")
    icon = fields.Char(string=u'icon Class', default="fa-pencil-square-o")
    # set
    direct = fields.Selection([("horizontal", "水平"), ("vertical", "垂直")], default='horizontal')
    width = fields.Selection([("1", "12个"), ("2", "6个"), ("3", "4个"), ("4", "3个"), ("6", "2个")], default="3")
    # header
    header_title = fields.Char(string=u'标题内容')
    # search
    search_type = fields.One2many("web.index.search.field", "window_id", string=u'搜索字段')
    tag = fields.Char(string=u'搜索窗口标签')

    can_filter = fields.Boolean(string=u'搜索后渲染', default=False)
    filter_tag = fields.Char(string=u'搜索用窗口标签')

    @api.multi
    def get_param(self):
        res = []
        for r in self:
            word = False
            if r.window_type == 'notice':
                word = "{'type':'notice','aim_class':'%s','model':'%s','func':'%s','color':'%s','click':'%s'}" % \
                       (r.aim_class, r.model, r.func, r.color, r.click)
            elif r.window_type == 'list':
                word = "{'type':'list','aim_class':'%s','model':'%s','func':'%s','pre_page':%s,'can_filter':%s,'filter_tag':'%s','action_func':%s}" % \
                       (r.aim_class, r.model, r.func, r.pre_page, r.can_filter, r.filter_tag, ("'%s'" % r.action_func if r.action_func else 'None'))
            elif r.window_type == 'pivot':
                word = "{'type':'pivot','aim_class':'%s','model':'%s','func':'%s','can_filter':%s,'filter_tag':'%s','showColTotal':%s,'showRowTotal':%s,'fixedColHeader':%s,'fixedRowHeader':%s}" % \
                       (r.aim_class, r.model, r.func, r.can_filter, r.filter_tag, r.showColTotal, r.showRowTotal, r.fixedColHeader, r.fixedRowHeader)
            elif r.window_type == 'value':
                word = "{'type':'value','aim_class':'%s','model':'%s','func':'%s','icon_back':'%s','icon':'%s'}" % \
                       (r.aim_class, r.model, r.func, r.icon_back, r.icon)
            elif r.window_type == 'search':
                word = "{'type':'search','aim_class':'%s','fields':[%s],'window_title':'%s','tag':'%s','model':'%s','func':'%s'}" % \
                       (r.aim_class, r.search_type.get_params(), r.name, r.tag, r.model, r.func)
            elif r.window_type == 'chart':
                word = "{'type':'chart','chart_list':%s,'aim_class':'%s','model':'%s','func':'%s','can_filter':%s,'filter_tag':'%s','chart_title':{'text':'%s','align':'%s','verticalAlign':'%s','y':%s},'chart_subtitle':{'text':'%s','align':'%s','verticalAlign':'%s','y':%s},'charts':[%s]%s%s}" \
                       % (r.chart_list, r.aim_class, r.model, r.func, r.can_filter, r.filter_tag, r.chart_title if r.chart_title else "", r.title_align, r.title_vertical_align, r.title_y, r.chart_subtitle if r.chart_subtitle else "", r.subtitle_align, r.subtitle_vertical_align, r.subtitle_y, r.charts.get_params(), r.get_xaxis(), r.get_yaxis())
            elif r.window_type == 'set':
                word = "{'type':'set','aim_class':'%s','model':'%s','func':'%s','can_filter':%s,'filter_tag':'%s','direct':'%s','width':'%s'}" \
                       % (r.aim_class, r.model, r.func, r.can_filter, r.filter_tag, r.direct, r.width)
            elif r.window_type == 'header':
                word = "{'type':'header','aim_class':'%s','can_filter':%s,'filter_tag':'%s','header_title':'%s'}" % \
                       (r.aim_class, r.can_filter, r.filter_tag, r.header_title)
            elif r.window_type == 'html':
                word = "{'type':'html','aim_class':'%s','can_filter':%s,'filter_tag':'%s','model':'%s','func':'%s'}" % \
                       (r.aim_class, r.can_filter, r.filter_tag, r.model, r.func)
            elif r.window_type == 'download':
                word = "{'type':'download','aim_class':'%s','can_filter':%s,'filter_tag':'%s','model':'%s','func':'%s','download_title':'%s'}" % \
                       (r.aim_class, r.can_filter, r.filter_tag, r.model, r.func, r.download_title)
            if word:
                res.append(word)
        return ','.join(res)

    @api.multi
    def get_xaxis(self):
        if self.xAxis_type != 'category':
            return ",'xAxis_type':'%s','xAxis_func':'%s','xAxis_model':'%s'" % (self.xAxis_type, self.xAxis_func, self.xAxis_model)
        else:
            return ",'xAxis_type':'%s'" % self.xAxis_type + ",'xAxis_cate':[%s]" % ','.join(["'%s'" % cate.name for cate in self.xAxis_cate])

    @api.multi
    def get_yaxis(self):
        if self.yAxis:
            return ",'yAxis':[%s]" % ','.join(["{'name':'%s','min':%s,'opposite':%s}" % (yaxis.name, yaxis.min, yaxis.opposite) for yaxis in self.yAxis])
        else:
            return ""


class IndexSearchField(models.Model):
    _name = "web.index.search.field"

    name = fields.Char(string=u'字段名', required=True)
    window_id = fields.Many2one("web.index.window", string=u'窗口')
    field_type = fields.Selection([("field", "对象"), ("char", "输入框"), ("date", "日期"), ("selection", "下拉框")], string=u'字段类型',
                                  required=True)
    model = fields.Char(string=u'资源获取对象')
    domain = fields.Char(string=u'Domain')
    tag = fields.Char(string=u'字段标签')
    selection_list = fields.One2many("web.index.search.field.selection", "field_id")
    context = fields.Char(string=u'Context', default="{}")

    @api.multi
    def get_params(self):
        res = []
        for r in self:
            word = False
            if r.field_type == 'field':
                word = "{'name':'%s','tag':'%s','type':'%s','model':'%s','cxt':%s," % (r.name, r.tag, r.field_type, r.model, r.context) + ("'domain':%s" % r.domain.replace(" ", "") if r.domain and r.domain.replace(" ", "") else "") + "}"
            elif r.field_type == 'char':
                word = "{'name':'%s','tag':'%s','type':'%s'," % (r.name, r.tag, r.field_type) + "}"
            elif r.field_type == 'date':
                word = "{'name':'%s','tag':'%s','type':'%s'," % (r.name, r.tag, r.field_type) + "}"
            elif r.field_type == 'selection':
                word = "{'name':'%s','tag':'%s','type':'%s','selection_list':%s}" % (r.name, r.tag, r.field_type, r.selection_list.get_key_value())
            if word:
                res.append(word)
        return ','.join(res)


class IndexSearchFieldSelection(models.Model):
    _name = "web.index.search.field.selection"
    _order = "seq"

    seq = fields.Integer()
    field_id = fields.Many2one("web.index.search.field")
    key = fields.Char(string=u'键')
    value = fields.Char(string=u'值')

    @api.multi
    def get_key_value(self):
        res = []
        for r in self:
            res.append("{'key':'%s','value':'%s'}" % (r.key, r.value))
        res = "[" + ','.join(res) + "]"
        return res


class IndexChartSingle(models.Model):
    _name = "web.index.chart.single"

    window_id = fields.Many2one("web.index.window", string=u'窗口')
    chart_type = fields.Selection([("spline", "曲线图"), ("column", "柱状图"), ("pie", "饼状图"), ("variablepie", "可变宽饼状图")],
                                  default="column")
    model = fields.Char(string=u'资源获取对象', required=True)
    func = fields.Char(string=u'资源获取方法', required=True)
    # chart - column
    grouping = fields.Selection([("True", "分组显示"), ("False", "重叠显示")], default="True")
    pointPadding = fields.Float(string=u'柱左右间距(最大为1)')
    pointPlacement = fields.Float(string=u'柱相对左右位移')
    color = fields.Char(string=u'颜色')
    # chart - column spline
    yAxis = fields.Integer(string=u'Y轴序号')
    # chart - pie variablepie
    size = fields.Float(string=u'总面积占比(%)')
    innerSize = fields.Float(string=u'内环半径占比(%)')
    startAngle = fields.Integer(string=u'起始角度', default=-180)
    endAngle = fields.Integer(string=u'结尾角度', default=180)
    zMin = fields.Float(string=u'以此值作为最小值')
    pie_align = fields.Float(default=50, string=u'饼状图圆心水平位置(%)')
    pie_vertical_align = fields.Float(default=50, string=u'饼状图圆心垂直位置(%)')
    click_call_title_change = fields.Boolean(string=u'点击数据触发标题变动', default=False)

    @api.multi
    def get_params(self):
        res = []
        for r in self:
            word = ""
            if r.chart_type == 'column':
                word = "{'type':'%s','model':'%s','func':'%s','grouping':%s,'pointPadding':%s,'pointPlacement':%s,'color':'%s','yAxis':%s}" % \
                       (r.chart_type, r.model, r.func, r.grouping, r.pointPadding, r.pointPlacement, r.color, r.yAxis)
            elif r.chart_type == 'spline':
                word = "{'type':'%s','model':'%s','func':'%s','yAxis':%s}" % (r.chart_type, r.model, r.func, r.yAxis)
            elif r.chart_type in ("pie", "variablepie"):
                word = "{'type':'%s','model':'%s','func':'%s','size':'%s','innerSize':'%s','startAngle':%s,'endAngle':%s,'zMin':%s,'center':['%s','%s'],'click_call_title_change':%s}" % \
                       (r.chart_type, r.model, r.func, str(r.size) + "%", str(r.innerSize) + "%", r.startAngle, r.endAngle, r.zMin, str(r.pie_align) + "%", str(r.pie_vertical_align) + "%", r.click_call_title_change)
            if word:
                res.append(word)
        return ','.join(res)


class IndexChartXAxisCategory(models.Model):
    _name = "web.index.chart.xaxis.category"

    window_id = fields.Many2one("web.index.window", string=u'窗口')
    name = fields.Char(string=u'名称', required=True)


class IndexChartYAxis(models.Model):
    _name = "web.index.chart.yaxis"

    window_id = fields.Many2one("web.index.window", string=u'窗口')
    name = fields.Char(string=u'标题', required=True)
    min = fields.Integer(string=u'最小值')
    opposite = fields.Boolean(string=u'右侧显示', default=False)
