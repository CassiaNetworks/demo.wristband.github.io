const hubConfig = require('configDir/peripheralConfig.json')
let allPers = hubConfig.allPers
const baseData = {
    mac: '',
    name: allPers[0], //  HW330,
    verify: false
}
const PerItemModel = Backbone.Model.extend({
    defaults: baseData,
    initialize: function () {
        this.set('cid', this.cid)
    }
});

const PerItemColle = Backbone.Collection.extend({
    initialize: function () {
        this.add(new PerItemModel)
    },
    test: function () {}
});
exports.baseData = baseData
exports.Model = PerItemModel
exports.Collection = PerItemColle