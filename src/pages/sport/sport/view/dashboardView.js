import {
    DashBoardItemColl
} from '../models/dashboardmodel'
import {
    dashboardStr
} from '../template/dashboardStr'

const dashBoardItemColl = new DashBoardItemColl()
const DashboardView = Backbone.View.extend({
    model: dashBoardItemColl,
    events: {
        'click .blue a': 'resetStep'
    },
    initialize: function () {
        this.render()
        this.listenTo(this.model, 'add', this.add)
        this.listenTo(this.model, 'change', this.upgrade)
    },
    resetStep: function (e) {

    },
    add: function (model) {
        debugger
        this.$el.append(dashboardStr(model.toJSON()))

    },
    upgrade: function (model) {
        debugger
        // this.$el.find()
    },
    render: function () {
        debugger
        const coll = this.model.toJSON()
        let str = ''
        coll.forEach(function (element) {
            str += dashboardStr(element)
        }, this);
        this.$el.html(str)
    }
})
setTimeout(function () {
    dashBoardItemColl.add({
        userName: 'ww',
        totalStep: '123',
        cal: '44',
        heartRate: '67',
        node: '1122',
        step: '20',
        message: 'pp'
    })
}, 1000)

export {
    DashboardView,
    DashBoardItemColl
}