let hubConfigItemStr = require('../template/hubConfigItemStr')
let hubItem = require('../models/hubitemmodel')
const app = require('../page')
const HubItemView = Backbone.View.extend({
    model: new hubItem.collection,
    events: {
        'click .addhub': 'addhub'
    },
    initialize: function () {
        this.listenTo(this.model, 'push', this.addhub)
        this.render()
    },
    template: _.template(hubConfigItemStr.liItem),
    addhub: function () {
        this.model.push(new hubItem.collection)
        $('ul.config-tip li.addhub').before(this.template(hubItem.baseData))
    },
    render: function () {
        let str = ''
       console.log('####')
       const self = this

        this.model.models.forEach(function (item) {
            debugger
            console.log(arguments);
            console.log(item);
            
            str += self.template(item.toJSON())
        })
       str+=hubConfigItemStr.footer
       console.log('dde',str);
       
        this.$el.html(str)
    }
});

module.exports = HubItemView