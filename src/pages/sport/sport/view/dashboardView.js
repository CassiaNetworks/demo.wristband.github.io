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
        'click .blue a': 'resetStep',
        'click .send': 'send'
    },
    send: function (e) {
        const target = e.target,
            type = target.dataset.type,
            content = $(target).prev().val()
        debugger


    },
    initialize: function () {
        this.render()
        this.userName = {}
        this.totalStep = {}
        this.cal = {}
        this.heartRate = {}
        this.step = {}


        for (let item of this.model.toJSON()) {
            this.userName[item.node] = this.$el.find(`li[data-node='${item.node}'] .totalStep`)
            this.totalStep[item.node] = this.$el.find(`li[data-node='${item.node}']> p span`)
            this.cal[item.node] = this.$el.find(`li[data-node='${item.node}'] .yellow p span`)
            this.heartRate[item.node] = this.$el.find(`li[data-node='${item.node}'] .red p span`)
            this.step[item.node] = this.$el.find(`li[data-node='${item.node}'] .blue p span`)
        }
        this.listenTo(this.model, 'add', this.add)
        this.listenTo(this.model, 'change', this.upgrade)
    },
    resetStep: function (e) {
        debugger
    },
    add: function (model) {
        const item = model.toJSON()
        this.$el.append(dashboardStr(model.toJSON()))
        this.userName[item.node] = this.$el.find(`li[data-node='${item.node}']> .totalStep`)
        this.totalStep[item.node] = this.$el.find(`li[data-node='${item.node}']> p span`)
        this.cal[item.node] = this.$el.find(`li[data-node='${item.node}'] .yellow p span`)
        this.heartRate[item.node] = this.$el.find(`li[data-node='${item.node}'] .red p span`)
        this.step[item.node] = this.$el.find(`li[data-node='${item.node}'] .blue p span`)

    },
    upgrade: function (model) {
        const item = model.toJSON()
        this.userName[item.node].html(item.userName)
        this.totalStep[item.node].html(item.totalStep)
        this.cal[item.node].html(item.cal)
        this.heartRate[item.node].html(item.heartRate)
        this.step[item.node].html(item.step)
    },
    render: function () {
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
        step: '20',
        message: 'pp',
        node: '11:22:33:44:55:66',
        say: true

    })
}, 1000)
setTimeout(function () {
    dashBoardItemColl.add({
        userName: 'ww',
        totalStep: '123',
        cal: '44',
        heartRate: '67',
        step: '20',
        message: 'pp',
        node: '11:22:33:44:55:66'
    })
}, 1000)

setTimeout(function () {
    dashBoardItemColl.at(0).set({
        userName: 'ww',
        totalStep: '0',
        cal: '0',
        heartRate: '607',
        step: '0',
        message: '0pp',
        node: '11:22:33:44:55:66'
    })
    // add({
    //         userName: 'ww',
    //         totalStep: '123',
    //         cal: '44',
    //         heartRate: '67',
    //         node: '1122',
    //         step: '20',
    //         message: 'pp'
    //     })
}, 2500)

export {
    DashboardView,
    DashBoardItemColl
}