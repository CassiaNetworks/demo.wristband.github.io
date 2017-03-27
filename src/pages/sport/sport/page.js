require('configModule')
require('./index.css')
require('backbone')
require('underscore')
var SportBodyViewStr = require('./template/sportbodyview')
const SportBodyView = Backbone.View.extend({
	tagName:'div',
	className:'sport-band',
	initialize:function(){
		this.render()
	},
	template:_.template(SportBodyViewStr),
	render:function(){
		 this.$el.html(this.template(this.model.attributes));
	},
	changeLan:function(){
		
	}
})