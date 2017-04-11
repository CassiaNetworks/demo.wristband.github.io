layui.use(['form'], function () {
    module.exports.form = layui.form()
})

const hubConfig = require('../config/hubConfig.json')



hubs.scanHandle(fnArr).notifyHandle(fnArr)
hubs.add({
    mac: ''
}).init({
    mac: ''
}).oauth({
    mac: ''
})

hubs.on('oauth', fn1)
hubs.on('scan', fn2)
hubs.on('notify', fn3)
hubs.on('conn', fn4)







//定义全局的hubs变量，存储所有hub的信息
let hubs = {
    conut: 0,
    timer: null, //检查hub在线定时器
    hubs: {},
    connetedPeripherals: {},
    interval: {
        timer: null,
        tasks: []
    },
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
    // next() {
    //     const arg = Array.prototype.slice(Array, arguments)
    //     const fn = arg[0].shift()
    //     fn && fn.apply(this, arguments)
    // },

    init(mac) {
        this.oauth(mac)
        this.on('oauth', function () {
            hubs.hubs[mac].scan(mac, 0)
        })
        this.on('scan', function () {
            hubs.hubs[mac].notify(mac)
        });
        this.__intervalTask()
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
        return this
    },
    __es(target, method, url, fn) {
        if (target.output[method]) {
            return
        }
        let es = target.output[method] = new EventSource(String(url));
        es.onmessage = function (event) {
            fn && fn(event)
        }
    },
    oauth(mac, option) {
        mac = mac || ''
        option = option || {
            silent: false
        }
        const hub = this.hubs[mac]
        if (!this.__online(mac)) {
            return
        }
        if (this.hubs[mac].method === '0') {
            return this
        }
        $.ajax({
            type: 'post',
            url: hub.server + '/oauth2/token',
            headers: {
                'Authorization': 'Basic ' + btoa(hub.developer + ':' + hub.password)
            },
            data: {
                "grant_type": "client_credentials"
            },
            context: this,
            success: function (data) {
                hub.access_token = data.access_token
                hub.tokenExpire = data.expires_in
                hub._escapeTime.token = 0
                if (!option.silent) {
                    this.trigger('oauth', {
                        mac,
                        data
                    })
                }
            },
            error: function (xhr) {
                this.trigger('oauthErr', {
                    mac,
                    xhr
                })
            }
        })
        return this
    },
    scan(mac, chip) {
        chip = chip || 0
        const hub = this.hubs[mac]
        if (!this.__online(mac)) {
            return
        }
        this.__es(hub.output.scan, 'scan', hub.server + '/gap/nodes/?event=1&mac=' + mac + '&chip=' + chip + '&access_token=' + hub.info.access_token,
            function (event) {
                let data = event.data
                if (data.match(/keep-alive/i))
                    return
                hubs.trigger('scan', {
                    mac,
                    chip,
                    data
                })
            });


        return this
    },
    scanHandle(fnArr) {
        hubs.on('scan', function (mac, data) {
            if (data.match(/keep-alive/i)) {
                return
            }
            fnArr.forEach(item => {
                item && item(mac, data)
            })
        })
    },
    notifyHandle(fnArr) {
        hubs.on('notify', function (mac, data) {
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
        if (!this.__online(mac)) {
            return
        }
        if (!hub.output.notify) {
            this.__es(hub.output.notify, hub.info.server + '/gatt/nodes/?event=1&mac=' + hub.info.mac + '&access_token=' + hub.info.access_token,
                function (event) {
                    let data = event.data
                    hubs.trigger('notify', {
                        mac,
                        data
                    })
                })
        }
        return this
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
        // _iterate(o, this.hubs, _close, this)
        _close(o, this.hubs, this)
        // this.off(obj.event)
        return this
    },
    __resetScanData(mac) {
        this.hubs[mac].scanData = {
            origin: {},
            sort: []
        }
    },
    /**
     * 定时任务
     * 
     * 
     */
    __intervalTask() {
        if (this.interval.timer) {
            return
        }
        this.tasks = [{
            fn: this.oauth,
            interval: 3000,
            escapeTime: 'token',
            silent: true
        }, {
            fn: this.devices,
            interval: 4,
            escapeTime: 'devices',
            silent: true
        }, {
            fn: this.__resetScanData,
            interval: 4,
            escapeTime: 'resetScanData',
            silent: true
        }, {
            fn: this.__sortByRssi,
            interval: 1,
            escapeTime: 'sort',
            silent: true
        }]
        this.interval.timer = setInterval(function () {
            for (let mac in this.hubs) {
                let hub = this.hubs[mac]
                this.interval.tasks.forEach(function (item) {
                    if (hub._escapeTime[item.escapeTime]++ === item.interval) {
                        item.fn && item.fn(mac, {
                            silent: item.silent
                        })
                    }
                })
            }
        }.bind(this), 1000)
        return this
    },

    __sortByRssi(mac) {
        const origin = this.hubs[mac].origin
        const stooges = _.values(origin)
        this.hubs[mac].sort = _.sortBy(stooges, 'avg')
        return this.hubs[mac].sort
    },
    __slectHub() {

    },
    /**
     * 
     * 
     * @param {obj} data 
     * @param {str} mac 
     * @param {obj} hub 
     * @param {obj} rule 
     */
    _scanDataColl(data, hub, rule) {
        const node = data.bdaddrs[0].bdaddr,
            name = data.name,
            rssi = data.rssi,
            type = data.bdaddrs[0].bdaddrType

        function initNode(node, scanData) {
            if (!scanData[node])
                scanData[node] = {
                    rssi: [],
                    node: '',
                    max: -500,
                    min: 0,
                    avg: 0
                }
        }

        function addData(node, hub) {
            initNode(node, hub.scanData.origin)
            hub.scanData.origin[node].node = node
            const len = hubs[node].rssi.push(parseInt(rssi))
            hub.scanData.origin[node].max = Math.max(rssi, hub.scanData.origin[node].max)
            hub.scanData.origin[node].min = Math.min(rssi, hub.scanData.origin[node].min)
            hub.scanData.origin[node].avg = (hub.scanData.origin[node].avg * (len - 1) + rssi) / len
            hub.scanData.origin[node].name = /unknown/.match(name) ? '' : name
            hub.scanData.origin[node].type = type
            hub.scanData.origin[node].mac = hub.info.mac
        }

        if (rule.filter === 'name' && rule.reg.match(name)) {
            addData(node, this.hubs)
        } else if (rule.filter === 'mac' && rule.reg.match(node)) {
            addData(node, this.hubs)
        } else {
            addData(node, this.hubs)
        }
    },
    __initScanData() {
        this.once('scan', function () {
            const mac = arguments[0],
                chip = arguments[1],
                data = JSON.parse(arguments[2]),
                node = data.bdaddrs[0].bdaddr,
                type = data.bdaddrs[0].bdaddrType,
                name = data.name,
                rssi = data.rssi

            this._scanDataColl(data, this.hubs[mac], {
                filter: 'name',
                rule: /o.name/
            })
        })
    },
    __autoConn(name) {
        const o = this.__selectPerHub(name)
        this.__conn(o)
        this.on('connFin', this.conn())
    },
    __selectPerHub(name) {
        const hubs = this.hubs
        let temp = []
        for (let hub in hubs) {
            temp.push(_.findWhere(hub, {
                name: name
            }))
        }
        return _.max(temp, function (item) {
            return item.avg
        })

    },
    conn(o) {
        o = o || {
            mac: '',
            node: '',
            type: '',
            name: ''
        }
        const hub = this.hubs[o.mac],
            mac = o.mac,
            node = o.node,
            type = o.type,
            name = o.name

        if (!mac) {
            const hubs = this.hubs
            for (let mac in hubs) {
                this.init(mac)



            }
        } else if (!this.__online(mac)) {
            return
        }
        this.__conn(o)
        return this
    },
    __conn(o) {
        const hub = this.hubs[o.mac],
            mac = o.mac,
            node = o.node,
            type = o.type,
            name = o.name
        $.ajax({
            type: 'post',
            url: hub.info.server + '/gap/nodes/' + o.node + '/connection?mac=' + o.mac,
            headers: hub.info.method === '0' ? '' : {
                'Authorization': hub.info.authorization
            },
            data: {
                "type": o.type || "public"
            },
            context: this,
            success: function (data) {
                this.addPer(o)
                this.__changeConnSta(node, mac)
                this.trigger('conn', {
                    mac,
                    node,
                    type,
                    name,
                    data
                })
            },
            always: function () {
                this.trigger('connFin', {
                    mac
                })
            }
        })
    },
    disconn(o) {
        o = o || {
            mac: this.connetedPeripherals[o.node],
            node: ''
        }
        const hub = this.hubs[o.mac],
            mac = o.mac,
            node = o.node
        if (this.__online(mac) || !this.__online(node)) {
            return
        }

        $.ajax({
            type: 'delete',
            url: hub.info.server + '/gap/nodes/' + o.node + '/connection?mac=' + o.hub,
            headers: hub.info.method === '0' ? '' : {
                'Authorization': hub.info.authorization
            },
            context: this,
            success: function (data) {
                this.remove(o)
                this.trigger('disconn', {
                    mac,
                    node,
                    data
                })
            }
        })
        return this
    },
    __changeConnSta(node, mac) {
        const sort = this.hubs[mac].scanData.sort
        for (let item of sort) {
            if (item.node === node) {
                item.conn = true
                return
            }
        }
    },
    addPer(o) {
        o = o || {
            node: '',
            mac: '',
            name: '',
            type: '',
            chip: ''
        }
        const node = o.node,
            mac = o.mac
        this.hubs[mac].connetedPeripherals = {
            node,
            mac,
            name: o.name,
            type: o.type,
            chip: o.chip
        }
        this.connetedPeripherals[node] = {
            node,
            mac,
            name: o.name,
            type: o.type,
            chip: o.chip
        }
        return this
    },
    removePer(o) {
        o = o || {
            mac: '',
            node: ''
        }
        const node = o.node,
            mac = o.mac
        this.hubs[mac].connetedPeripherals = null
        this.connetedPeripherals[node] = null
        return this
    },
    devices(o, option) {
        o = o || {
            mac: ''
        }
        option = option || {
            silent: false
        }
        const mac = o.mac
        const hub = this.hubs[o.mac]
        if (!hub) {
            return
        }
        $.ajax({
            type: 'get',
            url: hub.info.server + '/gap/nodes/?connection_state=connected&mac=' + o.hub,
            headers: hub.info.method === '0' ? '' : {
                'Authorization': hub.info.authorization
            },
            context: this,
            success: function (data) {
                const nodes = data.node
                for (let item of nodes) {
                    const node = item.id,
                        chip = item.chipId
                    if (!this.hubs[mac].connetedPeripherals[node])
                        this.addPer({
                            node,
                            mac,
                            chip,
                            name: '',
                            type: ''
                        })
                    else {
                        this.hubs[mac].connetedPeripherals[node].chip = chip
                        this.connetedPeripherals[node].chip = chip
                    }
                }
                for (let item of this.connetedPeripherals) {
                    const node = item.node
                    if (nodes.indeOf(node) === -1) {
                        this.removePer({
                            mac,
                            node
                        })
                    }
                }
                if (!option.silent) {
                    this.trigger('devices', {
                        mac,
                        data
                    })
                }
            }
        })
        return this
    },
    __online(mac) {
        return !!this.hubs[mac] || !!this.connetedPeripherals[mac]
    },
    __iterate(o, hubs, fn, context) {
        if (o.mac === 'all') {
            for (let key in hubs) {
                fn && fn.apply(context, {
                    key,
                    hubs
                })
            }
        } else if (_.isArray(o.mac)) {
            for (let key of o.mac) {
                fn && fn.apply(context, {
                    key,
                    hubs
                })
            }
        } else {
            fn && fn.apply(context, {
                mac: o.mac,
                hubs
            })
        }
    },
    write(o) {
        o = o || {
            mac: this.connetedPeripherals[o.node],
            node: '',
            value: '',
            handle: ''
        }
        const node = o.node,
            mac = o.mac,
            hub = this.hubs[mac],
            handle = o.handle,
            value = o.value

        if (!this.__online(mac) || !this.__online(node)) {
            return
        }

        $.ajax({
            type: 'get',
            url: hub.info.server + '/gatt/nodes/' + node + '/handle/' + handle + '/value/' + value + '/?mac=' + mac,
            headers: hub.info.method === '0' ? '' : {
                'Authorization': hub.info.authorization
            },
            success: function (data) {
                this.trigger('devices', {
                    mac,
                    node,
                    value,
                    handle,
                    data
                })
            }
        })
        return this
    },
    read(o) {
        o = o || {
            mac: this.connetedPeripherals[o.node],
            node: '',
            handle: ''
        }
        const node = o.node,
            mac = o.mac,
            hub = this.hubs[mac],
            handle = o.handle

        if (!this.__online(mac) || !this.__online(node)) {
            return
        }

        $.ajax({
            type: 'get',
            url: hub.info.server + '/gatt/nodes/' + node + '/handle/' + handle + '/value/?mac=' + mac,
            headers: hub.info.method === '0' ? '' : {
                'Authorization': hub.info.authorization
            },
            success: function (data) {
                this.trigger('read', {
                    mac,
                    node,
                    handle,
                    data
                })
            }
        })
        return this
    }

}


//  hubs 继承Backbone.Events的事件
_.defaults(hubs, Backbone.Events)
let peripherals = []



const startWork = function (hubs = {}, peripherals = []) {
    if (hubs.conut === 0 || peripherals.length === 0) {
        return
    }

}



export {
    hubs,
    peripherals,
    startWork
}