import api from 'publicDir/libs/api/api.js'
const hubConfig = require('configDir/hubConfig.json')
const utils = require('publicDir/libs/utils/utils')
const baseData = {
    method: hubConfig.info.method,
    hubMac: 'CC:1B:E0:E0:',
    hubIp: '192.168.0.153',
    server: hubConfig.info.cloundAddress,
    developer: hubConfig.info.developer,
    password: hubConfig.info.password,
    verify: false,
    online: false
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
    test: function (model) {
        debugger
        if (model.get('verify') === false)
            return
        api.use(model.toJSON())

        // 测试hub是否可用
        api.online({
            success: function () {
                debugger
                this.context.set('online', true)
                $(`li[data-cid='${this.context.cid}']`).find('.test i').html('OK')
            },
            error: function (xhr) {
                debugger
                this.context.set('online', false)
                $(`li[data-cid='${this.context.cid}']`).find('.test i').html(xhr[1])
            },
            context: model
        })
    }
})


exports.baseData = baseData
exports.Model = HubItemModel
exports.Collection = HubItemColle