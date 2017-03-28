require('configModule')
require('./index.css')
const lang = require('configDir/lang.json')
let sportBodyViewStr = require('./template/sportbodyview')
let SportBodyModel = Backbone.Model.extend({
	defaults: lang.en.sport,
	getLang: function () {
		let userlang = (navigator.language) ? navigator.language : navigator.userLanguage;
		userlang = userlang.match(/cn/i) ? 'cn' : 'en'
		return userlang
	},
	initialize: function () {
		// const userlang = this.getLang(),
		const userlang ='en',
		
			itemObj = lang[userlang].sport,
			_self = this
		_.each(itemObj, function (value, index) {
			this.set(index, value)
		},_self)
	}
})
let SportBodyView = Backbone.View.extend({
	model: new SportBodyModel,
	events: {
		"click #startWork": "startWork",
		"click #config": "config"
	},
	config:function(){
		
	},
	initialize: function () {
		this.render()
	},
	template: _.template(sportBodyViewStr),
	render: function () {
		this.$el.html(this.template(this.model.attributes));
	},
	changeLang: function () {

	}
})

new SportBodyView({el:$('#sport-dashboard')})