let hubConfigItemStr = require('../template/hubConfigItemStr')
let peripheralsConfigItemStr = require('../template/peripheralsConfigItemStr')
const hubItem = require('../models/hubitemmodel')
const perItem = require('../models/peripheralitemmodel')

let layuis = require('cp')
import appModel from '../page'

const hubItemCollection = new hubItem.Collection
const perItemCollection = new perItem.Collection

let HubItemView = Backbone.View.extend({
    model: function () {
        if (this.attributes.view === 'hub') {
            return hubItemCollection
        } else {
            return perItemCollection
        }
    },
    // model:new hubItem.Collection,
    events: {
        'click .addhub': 'addhub',
        'click .test button': 'test',
        'click .delete button': 'delete'
    },
    initialize: function () {

        this.model()
        if (this.attributes.view === 'hub') {
            this.attributes._model = hubItem.Model
            this.attributes.select = 'ul.config-tip-hub li.addhub'
            this.attributes['template'] = _.template(hubConfigItemStr.liItem)
            layuis.form.on(`radio`, function (data) {
                const cid = $(this).attr('name'),
                    parent = $(`li[data-cid='${cid}']`)
                let select = '',
                    flag = ''
                const verifys = {
                    "local": ['hubIp', 'location'],
                    "remote": ['hubMac', 'server', 'developer', 'password', 'location']
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
                location: function (value) {
                    const _value = $.trim(value)
                    if (_value === '') {
                        return 'Location不能为空'
                    }
                },
                mac: function (value) {
                    const _value = $.trim(value)
                    if (_value === '') {
                        return 'Mac不能为空'
                    }
                    if (/\：/.test(_value)) {
                        return '请使用英文符号'
                    }
                    if (!/^([0-9a-f]{2}\:){5}[0-9a-f]{2}$/i.test(_value)) {
                        return 'Mac输入错误'
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
                    if (!/^[a-z_]+[a-z0-9_]*$/i.test(_value)) {
                        return 'Develop只能是字母数字下划线，且不能以数字开头'
                    }
                },
                password: function (value) {
                    const _value = $.trim(value)
                    if (_value === '') {
                        return 'Password不能为空'
                    }
                }
            });

        } else {
            this.attributes['template'] = _.template(peripheralsConfigItemStr.liItem)
            this.attributes._model = perItem.Model
            this.attributes.select = 'ul.config-tip-peripheral li.addhub'
        }



        layuis.form.on('submit(hubs)', function (data) {
            console.log(JSON.stringify(data.field));
            return false;
        });
        this.render()

    },
    addhub: function () {
        const newModel = new this.attributes._model,
            lang = appModel.get(appModel.get('lang'))
        this.model().push(newModel)
        let keys = _.defaults(newModel.toJSON(), lang)
        $(this.attributes.select).before(this.attributes.template(keys))
        layuis.form.render()
    },
    getData: function (cid) {
        const $li = $(`li[data-cid='${cid}']`, this.el),
            form = layuis.form
        let _method = this.model().findWhere({
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
        this.model().remove(this.model().get(cid))
        parent.remove()

    },
    render: function () {

        let str = ''
        const lang = appModel.get(appModel.get('lang'))
        const self = this
        this.model().models.forEach(function (item) {
            str += self.attributes.template(_.defaults({}, item.toJSON(), lang))
            console.log(_.defaults({}, item.toJSON(), lang).method)
        })
        str += hubConfigItemStr.footer
        this.$el.html(str)
        layuis.form.render()
    }
});

module.exports = HubItemView