const finshedConfig = require('')
const startWork = require('')
let sportEventProxy = {}
_.extend(sportEventProxy, Backbone.Events)

sportEventProxy.on('finshedConfig',finshedConfig)
sportEventProxy.on('startWork',startWork)