const dashBoardItemModel = Backbone.Model.extend({
    defaults: {
        userName: '',
        totalStep: '',
        cal: '',
        heartRate: '',
        node: '',
        step: '',
        message:''
    },
    initialize:function(){
        this.set('cid',this.cid)
    }
})

const DashBoardItemColl = Backbone.Collection.extend({
    model:dashBoardItemModel,
    initialize:function(){
    }
});
export {DashBoardItemColl}
