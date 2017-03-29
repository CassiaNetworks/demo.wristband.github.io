require('configModule')
require('./index.css')
const lang = require('configDir/lang.json')
const sportBodyViewStr = require('./template/sportbodyview')
const sportEventProxy = require('./events/sportEvents')
const utils = require('publicDir/libs/utils/utils')
const configTip = require('./template/configTip')
let SportBodyModel = Backbone.Model.extend({
	defaults: lang.sport,
	initialize: function () {
		this.on('change:lang', function (model, newValue) {
			sportEventProxy.trigger('changeLang', this.get(newValue))
		})
	}
})
let sportBodyModel = new SportBodyModel({
	'lang': utils.getLang()
})
let SportBodyView = Backbone.View.extend({
	model: sportBodyModel,
	events: {
		"click #startWork": "startWork",
		"click #config": "propConfig"
	},
	propConfig: function () {
		sportEventProxy.trigger('config', {
			area: ['700px', '500px'],
			tab:[{
				title:"hub配置",
				content:configTip
			},{
				title:'gggggg',
				content: configTip
			}],
			shade: 0.6 //遮罩透明度
				,
			maxmin: true //允许全屏最小化
				,
			anim: 5 //0-6的动画形式，-1不开启
				
			
		})

	},
	initialize: function () {
		this.render()
	},
	changeLang: function (key) {
		const _key = key === 'en' ? 'en' : 'cn'
		this.model.set('lang', _key)
	},
	template: _.template(sportBodyViewStr),
	render: function () {
		this.$el.html(this.template(this.model.get(this.model.get('lang'))));
		return this
	}
})

var sportView = new SportBodyView({
	el: $('#root')
})
setTimeout(function () {
	sportView.changeLang('en')
	$('#config').trigger('click')
}, 1000)
