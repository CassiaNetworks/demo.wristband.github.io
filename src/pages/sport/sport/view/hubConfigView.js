let hubConfigItemStr = require('../template/hubConfigItemStr')
let hubItem = require('../models/hubitemmodel')
let layuis = require('cp')
import appModel from '../page'
let HubItemView = Backbone.View.extend({
    model: new hubItem.Collection,
    events: {
        'click .addhub': 'addhub',
        'click .test button': 'test',
        'click .delete button': 'delete'
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
    getData: function (cid) {
        const $li = $(`li[data-cid='${cid}']`, this.el),
            form = layuis.form
        let _method = this.model.findWhere({
                cid
            }).get('method'),
            objArr = $('input[type = "text"]', $li).serializeArray(),
            parseData = {}
        for (let item of objArr) {
            parseData[item.name] = item.value
        }
        parseData.method = _method
        debugger
        form.on(`radio(${cid})`, function (data) {
            parseData.method = _method = data.value
        });

        debugger

    },
    test: function (e) {
        const cid = e.target.dataset.cid
        this.getData(cid)
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

layuis.form.on('submit(s1)', function(data){
    console.log(JSON.stringify(data.field));
    return false;
  });