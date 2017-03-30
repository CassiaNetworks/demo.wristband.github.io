let hubConfigItemStr = require('../template/hubConfigItemStr')
let hubItem = require('../models/hubitemmodel')
let layuis = require('cp')
import appModel from '../page'
let HubItemView = Backbone.View.extend({
    model: new hubItem.Collection,
    events: {
        'click .addhub': 'addhub'
    },
    initialize: function () {
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