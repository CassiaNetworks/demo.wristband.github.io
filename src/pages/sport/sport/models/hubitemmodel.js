const baseData = {
    control: 1,
    hubMac: '',
    hubIp: '',
    server: '',
    developer: '',
    password: ''
}
const HubItemModel = Backbone.Model.extend({
    defaults: baseData
});

const hubItemColle = Backbone.Collection.extend({
    initialize: function () {

    }
}, {
    test: function (model) {
        console.log(model)
    }
});
exports.baseData = baseData
exports.Model = HubItemModel
exports.collection = hubItemColle