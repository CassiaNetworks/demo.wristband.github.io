layui.use(['form'], function() {
    module.exports.form = layui.form()
})

const hubConfig = require('../config/hubConfig.json')



hubs.scanHandle(fnArr).notifyHandle(fnArr)

hubs.add({
    mac:
}).oauth(mac).then(function() {
    hubs.notify(mac)
}).then(function() {
    scan(mac, 0)
})



function _iterate(o, hubs, fn, context) {
    let temp = _.defaults({}, o)
    let promiseArr = new promise()
    if (o.mac === '') {
        for (let key in hubs) {
            temp.mac = key
            fn && fn.apply(context, temp, hubs)
        }
    } else if (_.isArray(o.mac)) {
        for (let key of o.mac) {
            temp.mac = key
            fn && fn.apply(context, temp, hubs)
        }
    } else {
        fn && fn.apply(context, o, hubs)
    }
}



//定义全局的hubs变量，存储所有hub的信息
let hubs = {
    conut: 0,
    timer: null, //检查hub在线定时器
    hubs: {},
    /**
     * 定时任务
     * {fn:,
     * arg:,
     * context:,
     * escapeTime,
     * time   秒
     * 
     * 
     * 
     * }
     */
    next() {
        const arg = Array.prototype.slice(Array, arguments)
        const fn = arg[0].shift()
        fn && fn.apply(this, arguments)
    },

    init(mac) {
        this.oauth(mac).then(function(self) {
                return self.
            })
            // this.tasks.push(this.oauth.bind(o))
            // this.tasks.push(this.notify.bind(o))
            // setTimeout(this.next.bind(this, this.tasks), 0)
        return this
    },
    add(o = {}) {
        const mac = o.mac
        let hub = {}

        function _add() {
            if (this.hubs[mac]) {
                throw new Error(`${mac} has existed`)
            } else {
                $.extend(true, hub, hubConfig)
                Object.keys(hub).forEach(key => {
                    if (o[key])
                        _.extend(hub[key], o[key])
                })
                this.hubs[mac] = hub
            }
        }

        if (mac === undefined) {
            return
        } else {
            _add()
        }
        return this
            // this.init({
            //         mac
            //     })
            // setTimeout(this.next, 0)

    },
    remove(mac) {
        if (this.hubs[mac])
            this.hubs[mac] = null
    },
    __es(target, method, url, fn) {
        if (target.output[method]) {
            return
        }
        let es = target.output[method] = new EventSource(String(url));
        es.onmessage = function(event) {
            fn && fn(event)
        }
    },
    oauth(mac) {
        mac = mac || ''
        const hub = this.hubs[mac]
        if (!hub) {
            return
        }
        if (this.hubs[mac].method === '0') {
            return Promise.resolve(this)
        }
        return $.ajax({
            type: 'post',
            url: hub.server + '/oauth2/token',
            headers: {
                'Authorization': 'Basic ' + btoa(hub.developer + ':' + hub.password)
            },
            data: {
                "grant_type": "client_credentials"
            },
            context: self,
            success: function(data) {
                hub.access_token = data.access_token
                hub.tokenExpire = data.expires_in
            }
        })
    },
    scan(mac, chip) {
        chip = chip || 0
        this.__es(hubs[key].output.scan, 'scan', hubs[key].server + '/gap/nodes/?event=1&mac=' + key + '&chip=' + o.chip + '&access_token=' + hubs[key].info.access_token,
            function(event) {
                hubs.trigger('scan', [mac, event.data])
            });


        return this
    },
    scanHandle(fnArr) {
        hubs.on('scan', function(mac, data) {
            if (data.match(/keep-alive/i)) {
                return
            }
            fnArr.forEach(item => {
                item && item(mac, data)
            })
        })
    },
    notifyHandle(fnArr) {
        hubs.on('notify', function(mac, data) {
            if (data.match(/keep-alive/i)) {
                return
            }
            fnArr.forEach(item => {
                item && item(mac, data)
            })
        })
    },
    notify(mac) {
        const hub = this.hubs[mac]
        if (!hub.output.notify) {
            __es(hub.output.notify, hub.info.server + '/gatt/nodes/?event=1&mac=' + hub.info.mac + '&access_token=' + hub.info.access_token,
                function(event) {
                    hubs.trigger('notify', [hub.info.mac, event.data])
                    return Promise.resolve(this)
                })
        } else {
            return Promise.resolve(this)
        }
    },
    close(o) {
        o = o || {
            mac: '',
            event: ''
        }
        if (o.event === '') {
            return
        }

        function _close(o, hubs, self) {
            hubs[o.mac].output[o.event] && hubs[o.mac].output[o.event].close()
            hubs[o.mac].output[o.event] = null
        }
        _iterate(o, this.hubs, _close, this)

        // this.off(obj.event)
        return this
    },

    /**
     * 定时任务
     * 
     * 
     */
    intervalTask() {
        const self = this
        setInterval(function() {
            self.intervalTaskList.forEach(item => {
                if (item.escapeTime === undefined) {
                    item.escapeTime = 0
                }
                if (item.escapeTime++ === item.time)
                    item && item.apply(item.context, item.arg).then(function() {
                        item.escapeTime = 0
                    })
            })
        }, 1000)
        return this
    },

    conn(o) {
        o = o || {
            hub: '',
            node: '',
            type: ''
        }
        const hub = this.hubs[o.hub]

        const fn = function() {
            return $.ajax({
                type: 'post',
                url: hub.info.server + '/gap/nodes/' + o.node + '/connection?mac=' + o.hub,
                headers: hub.info.method === '0' ? '' : {
                    'Authorization': hub.info.authorization
                },
                data: {
                    "type": o.type || "public"
                },
                context: this,
                success: function(data) {
                    // debugger
                    this.next && this.next.call(this, o.hub, o.node, data)
                    console.log(data)
                    o.success && o.success(o.hub || o.hub, o.node, data)
                    this.trigger('conn', [o.hub || o.hub, o.node, data])
                }
            })
        }.bind(this)

        return fn()
    },
    disconn() {
        o = o || {
            hub: '',
            node: '',
            type: ''
        }
        const hub = this.hubs[o.hub]

        function fn() = {
            $.ajax({
                type: 'delete',
                url: hub.info.server + '/gap/nodes/' + o.node + '/connection?mac=' + o.hub,
                headers: hub.info.method === '0' ? '' : {
                    'Authorization': hub.info.authorization
                },
                data: {
                    "type": o.type || "public"
                },
                context: this,
                success: function(data) {
                    // debugger
                    this.next && this.next.call(this, o.hub, o.node, data)
                    console.log(data)
                    o.success && o.success(o.hub || o.hub, o.node, data)
                    this.trigger('disconn', [o.hub || o.hub, o.node, data])
                }
            })
        }.bind(this)

        this.tasks.push(fn)
        return this

    },
    devices(o) {
        o = o || {}
        $.ajax({
            type: 'get',
            url: api.server + '/gap/nodes/?connection_state=connected&mac=' + o.hub,
            headers: hub.info.method === '0' ? '' : {
                'Authorization': hub.info.authorization
            },
            context: this,
            success: function(data) {
                this.next && this.next.call(this, o.hub, data)
                console.log(data)
                o.success && o.success(o.hub || o.hub, data)
                this.trigger('disconn', [o.hub || o.hub, data])
            }
        })
        return this
    },
    write() {

    },
    read() {

    }

}


//  hubs 继承Backbone.Events的事件
_.defaults(hubs, Backbone.Events)
let peripherals = []



const startWork = function(hubs = {}, peripherals = [], fnArr = []) {
    if (hubs.conut === 0 || peripherals.length === 0) {
        return
    }

}



export {
    hubs,
    peripherals,
    startWork
}