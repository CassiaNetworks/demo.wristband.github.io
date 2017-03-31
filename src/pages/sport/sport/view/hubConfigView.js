let hubConfigItemStr = require('../template/hubConfigItemStr')
let hubItem = require('../models/hubitemmodel')
let layuis = require('cp')
import appModel from '../page'
let HubItemView = Backbone.View.extend({
    model: new hubItem.Collection,
    events: {
        'click .addhub': 'addhub',
        'click .test button': 'test',
        'click .delete button': 'delete'
    },
    initialize: function () {
        //更改需要
        layuis.form.on(`radio`, function (data) {
            const cid = $(this).attr('name'), parent = $(`li[data-cid='${cid}']`)
            let select = '', flag = ''
            const verifys = {
                "local": ['hubIp'],
                "remote": ['hubMac', 'server', 'developer', 'password']
            }
            let verifyElem = parent.find('*[lay-verify]')
            verifyElem.removeAttr('lay-verify').addClass('layui-bg-gray layui-disabled')
            if (data.value === '0') {
                flag = verifys.local
            } else {
                flag = verifys.remote
            }
            flag.forEach(function (item) {
                if (select === '') {
                    select = `[name='${item}']`
                } else {
                    select += `,[name='${item}']`
                }
            })
            parent.find(select).each(function () {
                $(this).attr('lay-verify', $(this).attr('name')).removeClass('layui-bg-gray layui-disabled')
            })

        });

        //表单验证规则
        layuis.form.verify({
            hubMac: function (value) {
                const _value = $.trim(value)
                if (_value === '') {
                    return 'HubMac不能为空'
                }
                if (/\：/.test(_value)) {
                    return '请使用英文冒号'
                }
                if (!/^([0-9a-f]{2}\:){5}[0-9a-f]{2}$/i.test(_value)) {
                    return 'HubMac输入错误'
                }

            },
            hubIp: function (value) {
                const _value = $.trim(value)
                if (_value === '') {
                    return 'HubIp不能为空'
                }
                if (/\。/.test(_value)) {
                    return '请使用英文符号'
                }
                if (!/^(?:(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:1[0-9][0-9]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:2[0-5][0-5])|(?:25[0-5])|(?:1[0-9][0-9])|(?:[1-9][0-9])|(?:[0-9]))$/.test(_value)) {
                    return 'HubIp输入错误'
                }

            },
            server: function (value) {
                const _value = $.trim(value)
                if (_value === '') {
                    return 'Server不能为空'
                }
                if (/\。/.test(_value)) {
                    return '请使用英文符号'
                }
            },
            developer: function (value) {
                const _value = $.trim(value)
                if (_value === '') {
                    return 'Developer不能为空'
                }
                if (!/^[a-z]+[a-z0-9_]*$/i.test(_value)) {
                    return '用户名不能有特殊字符'
                }
            },
            password: function (value) {
                const _value = $.trim(value)
                if (_value === '') {
                    return 'Password不能为空'
                }
            }
        })
        layuis.form.on('submit(hubs)', function (data) {
            console.log(JSON.stringify(data.field));
            return false;
        });
        this.render()
    },
    template: _.template(hubConfigItemStr.liItem),
    addhub: function () {
        const newModel = new hubItem.Model,
            lang = appModel.get(appModel.get('lang'))
        this.model.push(newModel)
        let keys = _.defaults(newModel.toJSON(), lang)
        $('ul.config-tip li.addhub').before(this.template(keys))
        layuis.form.render()
    },
    getData: function (cid) {
        const $li = $(`li[data-cid='${cid}']`, this.el),
            form = layuis.form
        let _method = this.model.findWhere({
            cid
        }).get('method'),
            objArr = $('input[type = "text"]', $li).serializeArray(),
            parseData = {}
        for (let item of objArr) {
            parseData[item.name] = item.value
        }
        parseData.method = _method
        form.on(`radio(${cid})`, function (data) {
            parseData.method = _method = data.value
        });
    },
    test: function (e) {
        const cid = e.target.dataset.cid
        this.getData(cid)
    },
    delete: function (e) {
        const cid = e.target.dataset.cid,
        parent = $(`li[data-cid='${cid}']`)
        this.model.remove(this.model.get(cid))
        parent.remove()

    },
    render: function () {
        let str = ''
        const lang = appModel.get(appModel.get('lang'))
        console.log(lang)
        const self = this
        this.model.models.forEach(function (item) {
            str += self.template(_.defaults({}, item.toJSON(), lang))
            console.log(_.defaults({}, item.toJSON(), lang).method)
        })
        str += hubConfigItemStr.footer
        console.log('dde', str);

        this.$el.html(str)
        layuis.form.render()
    }
});

module.exports = HubItemView

