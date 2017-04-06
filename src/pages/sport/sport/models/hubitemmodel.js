import api from 'publicDir/libs/api/api.js'
const hubConfig = require('configDir/hubConfig.json')
const baseData = {
    method: 0,
    hubMac: 'CC:1B:E0:E0:',
    hubIp: '',
    server: hubConfig.info.cloundAddress,
    developer: hubConfig.info.developer,
    password: hubConfig.info.password
}
const HubItemModel = Backbone.Model.extend({
    defaults: baseData,
    initialize: function () {
        this.set('cid', this.cid)
    }
});

const HubItemColle = Backbone.Collection.extend({
    initialize: function () {
        this.add(new HubItemModel)
    },
    test: function (data) {
        api.use(data).oauth2({
            context: this.get(data.cid),
            success: function () {
                console.log('获取token成功')
            },
            error: function (xhr) {
                debugger
                $(`li[data-cid='${this.context.cid}']`).find('.test i').html('get token failed')
                console.log('获取token失败')
            }
        })
        api.on('oauth2', function () {
            api.getInfo({
                success: function (data) {
                    debugger
                    this.set('msg', data)
                    //显示测试卷结果
                    $(`li[data-cid='${this.context.cid}']`).find('.test i').html(data)
                },
                error: function (xhr) {
                    debugger
                    this.context.set('msg', xhr[1])
                    $(`li[data-cid='${this.context.cid}']`).find('.test i').html(xhr[1])
                },
                context: this.get(data.cid)
            })
        })
    }
});
exports.baseData = baseData
exports.Model = HubItemModel
exports.Collection = HubItemColle