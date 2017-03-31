const hubConfig = require('configDir/hubConfig.json')
const baseData = {
    method: 0,
    hubMac: '',
    hubIp: '',
    server: hubConfig.info.cloundAddress,
    developer: hubConfig.info.developer,
    password: hubConfig.info.password
}
const HubItemModel = Backbone.Model.extend({
    defaults: baseData,
    initialize:function(){
        this.set('cid',this.cid)
    }
});

const HubItemColle = Backbone.Collection.extend({
    initialize: function () {
    
    }
});
exports.baseData = baseData
exports.Model = HubItemModel
exports.Collection = HubItemColle