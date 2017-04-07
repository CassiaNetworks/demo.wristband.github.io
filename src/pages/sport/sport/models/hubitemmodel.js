import api from 'publicDir/libs/api/api.js'
const hubConfig = require('configDir/hubConfig.json')
const utils = require('publicDir/libs/utils/utils')
const baseData = {
    method: hubConfig.info.method,
    hubMac: 'CC:1B:E0:E0:',
    hubIp: '192.168.0.109',
    server: hubConfig.info.cloundAddress,
    developer: hubConfig.info.developer,
    password: hubConfig.info.password,
    verify:false,
    online:false
}
const HubItemModel = Backbone.Model.extend({
    defaults: baseData,
    initialize: function () {
        this.set('cid', this.cid)
    }
});

const HubItemColle = Backbone.Collection.extend({
    initialize: function () {
        console.log(this)
        this.on('add change remove', utils.hubInit)
        this.add(new HubItemModel)
    },
    test: function (data) {
        api.use(data).oauth2({
            context: this.get(data.cid),
            success: function () {
                if (this.context.get('method') === '1')
                    console.log('获取token成功')
                // 测试hub是否可用
                api.getInfo({
                    success: function (data) {
                        debugger
                        this.context.set('msg', 'ok')
                        $(`li[data-cid='${this.context.cid}']`).find('.test i').html(this.context.get('msg'))
                    },
                    error: function (xhr) {
                        debugger
                        this.context.set('msg', xhr[1])
                        $(`li[data-cid='${this.context.cid}']`).find('.test i').html(xhr[1])
                    },
                    context: this.context
                })
            },
            error: function () {
                debugger
                $(`li[data-cid='${this.context.cid}']`).find('.test i').html('get token failed')
                console.log('获取token失败')
            }
        })

    }
});
exports.baseData = baseData
exports.Model = HubItemModel
exports.Collection = HubItemColle