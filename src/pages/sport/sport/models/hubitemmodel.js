const api = require('publicDir/libs/api/api.js')
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
        api.use({
            data
        }).oath2({
            success:function(){
                this.model()
            }
        })
        api.on('oauth2', api.getInfo({
            success: function () {
                debugger
            },
            context:this
        }))
    }
});
exports.baseData = baseData
exports.Model = HubItemModel
exports.Collection = HubItemColle