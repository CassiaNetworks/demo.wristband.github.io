layui.use(['form'], function () {
    module.exports.form = layui.form()
})

const hubConfig = require('../config/hubConfig.json')



hubs.scanHandle(fnArr).notifyHandle(fnArr)
hubs.add(mac).init(mac)

hubs.on('conn', fn4)







//定义全局的hubs变量，存储所有hub的信息
let hubs = {
    conut: 0,
    timer: null, //检查hub在线定时器
    hubs: {}, //所有hub
    scanHubs: [], //正在扫描的hub
    connHubs: [],
    conning: [],
    writeHubs: [],
    connetedPeripherals: {}, //所有连接的设备
    interval: { //定时任务
        timer: null,
        tasks: []
    },
    init(mac) {
        this.oauth(mac)
        this.on('oauth', function (o) {
            hubs.hubs[mac].scan(o.mac, 0)
            hubs.__intervalTask()
        })
        this.on('scanData', function (o) {
            hubs.hubs.notify(o.mac)
            hubs._scanDataColl(o)
        })

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
                hub.status.online = true
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
                if (hubs.scanHubs.indeOf(mac) === -1) {
                    hubs.scanHubs.push(mac)
                }
                if (event.data.match(/keep-alive/i))
                    return
                hubs.trigger('scanData', {
                    mac,
                    chip,
                    data: event.data
                })
            });


        return this
    },
    // scanHandle(fnArr) {
    //     hubs.on('scan', function (mac, data) {
    //         fnArr.forEach(item => {
    //             item && item(mac, data)
    //         })
    //     })
    // },
    // notifyHandle(fnArr) {
    //     hubs.on('notify', function (mac, data) {
    //         if (data.match(/keep-alive/i)) {
    //             return
    //         }
    //         fnArr.forEach(item => {
    //             item && item(mac, data)
    //         })
    //     })
    // },
    notify(mac) {
        const hub = this.hubs[mac]
        if (!this.__online(mac)) {
            return this
        }
        if (!hub.output.notify) {
            this.__es(hub.output.notify, hub.info.server + '/gatt/nodes/?event=1&mac=' + hub.info.mac + '&access_token=' + hub.info.access_token,
                function (event) {
                    if (event.data.match(/keep-alive/)) {
                        return
                    }
                    hubs.trigger('notify', {
                        mac,
                        data: event.data
                    })
                })
        }
        return this
    },
    __delete(item, Arr) {
        const index = Arr.indeOf(item)
        if (index === -1)
            return
        else {
            return Arr.splice(index, 1)
        }
    },
    close(o) {
        o = o || {
            mac: '',
            event: ''
        }
        if (!o.event) {
            return
        }
        this.hubs[o.mac].output[o.event] && this.hubs[o.mac].output[o.event].close()
        this.hubs[o.mac].output[o.event] = null
        this.__delete(o.mac, this.scanHubs)
        return this
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
        this.interval.tasks = [{
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
            fn: this.__clearZombyScanData,
            interval: 1,
            escapeTime: 'clearZombyScanData',
            silent: true
        }, {
            fn: this.__sortByRssi,
            interval: 1,
            escapeTime: 'sortByRssi',
            silent: true
        }]
        this.interval.timer = setInterval(function () {
            for (let mac in this.hubs) {
                let hub = this.hubs[mac]
                this.interval.tasks.forEach(function (item) {
                    if (hub._escapeTime[item.escapeTime]++ === item.interval) {
                        item.fn && item.fn.call(this, mac, {
                            silent: item.silent
                        })
                    }
                })
            }
        }.bind(this), 1000)
        return this
    },
    __clearZombyScanData(mac, option) {
        option = option || {
            silent: false
        }
        const origin = this.hubs[mac].scanData.origin
        for (let node in origin) {
            if (origin[node].life-- === 0) {
                this.__syncDelScanData(mac, node)
                if (!option.silent) {
                    hubs.trigger('clearZombyScanData', {
                        node,
                        mac
                    })
                }
            }
        }
        this.hubs[mac]._escapeTime.clearZombyScanData = 0

    },
    __hubAvailable(mac) {
        if (this.hubs[mac].status.conn < hubs[mac].config.maxConnected) {
            console.warn(`hub ${mac} has connected max`)
        }
        this.trigger('maxConnected', {
            mac
        })
        return this.__online(mac) && this.connHubs.indexOf(mac) === -1 && this.hubs[mac].status.conn < hubs[mac].config.maxConnected
    },
    __syncDelScanData(mac, node) {
        const origin = this.hubs[mac].scanData.origin,
            sort = this.hubs[mac].scanData.sort
        let index

        origin[node] = null
        //删除sort.name中的相应值
        if (node.name) {
            index = _.findIndex(sort.name, function (item) {
                return item.node === node
            })
            if (index > -1) {
                sort.name[name].splice(index, 1)
            }
        }
        //删除sort.rssi中相应值
        index = _.findIndex(sort.rssi, function (item) {
            return item.node === node
        })
        if (index > -1) {
            sort.rssi.splice(index, 1)
        }
    },
    __sortByRssi(mac, option) {
        option = option || {
            silent: false
        }
        this.hubs[mac].sort.rssi = _.sortBy(this.hubs[mac].sort.rssi, 'avg')
        for (let name in this.hubs[mac].sort.name) {
            this.hubs[mac].sort.name[name] = _.sortBy(this.hubs[mac].sort.name[name], 'avg')
        }
        if (!option.silent) {
            hubs.trigger('sortByRssi')
        }
    },

    __perAvailable(node) {
        return this.conning.indexOf(node) === -1
    },
    /**
     * 
     * 
     * @param {any} [name=[]] 
     * @param {any} [option={}] 
     * @returns 
     */
    __slectHubByName(name, option) {
        const hubs = this.hubs
        option = option || {
            available: true,
            rssiAvg: -80
        }
        //存储当前 所有/可用 hub扫描到的名为 name 的设备
        let availableHubs = []
        for (let mac in hubs) {
            if (option.available) {
                if (this.__hubAvailable(mac))
                    availableHubs.push(mac)
            } else {
                availableHubs.push(mac)
            }
        }

        let filtedData = {}
        for (let mac of availableHubs) {
            filtedData[mac] = this.hubs[mac].scanData.sort.rssi.filter(function (item) {
                return item.avg > option.rssiAvg && name.indexOf(item.name) > -1 && this.__perAvailable(item.node)
            })
        }

        let result = {},
            temp = []
        for (let mac in filtedData) {
            temp.concat(filtedData[mac])
        }
        temp = _.sortBy(temp, 'avg')
        for (let mac in filtedData){
            
        }





    },
    __slectHubByNode(node, option) {

    },

    // {
    //     mac,
    //     chip,
    //     data: event.data
    // }
    _scanDataColl(o) {
        const node = o.data.bdaddrs[0].bdaddr,
            name = o.data.name,
            rssi = parseInt(o.data.rssi),
            type = o.data.bdaddrs[0].bdaddrType,
            mac = o.mac

        function initNode(node, scanData, callback) {
            if (!scanData[node]) {
                scanData[node] = {
                    rssi: [],
                    node: '',
                    mac: '',
                    max: -200,
                    min: 0,
                    avg: 0,
                    name: '',
                    type: '',
                    lift: 4,
                    times: 0
                }
                callback && callback.call(this)
            }
        }

        function addData(node, hub) {
            let index
            initNode(node, hub.scanData.origin)
            const len = hubs[node].rssi.push(rssi)
            hub.scanData.origin[node].node = node
            hub.scanData.origin[node].mac = mac
            hub.scanData.origin[node].max = Math.max(rssi, hub.scanData.origin[node].max)
            hub.scanData.origin[node].min = Math.min(rssi, hub.scanData.origin[node].min)
            hub.scanData.origin[node].avg = (hub.scanData.origin[node].avg * (len - 1) + rssi) / len
            hub.scanData.origin[node].name = name.match(/unknown/) ? '' : name
            hub.scanData.origin[node].type = type
            hub.scanData.origin[node].life = 4 //生命周期是4秒
            hub.scanData.origin[node].times = len
            hub.scanData.origin[node].free = true

            //更新hub.scanData.sort.name值
            if (hub.scanData.origin[node].name) {
                hub.scanData.sort.name[name] = []
            } else {
                index = _.findIndex(hub.scanData.sort.name, function (item) {
                    return item.node === node
                })
                if (index === -1) {
                    hub.scanData.sort.name[name].push(this.scanData.origin[node])
                } else {
                    hub.scanData.sort.name[name].splice(index, 1, hub.scanData.origin[node])
                }
            }


            //更新hub.scanData.sort.rssi值
            index = _.findIndex(hub.scanData.sort.rssi, function (item) {
                return item.node === node
            })
            if (index === -1) {
                hub.scanData.sort.rssi.push(this.scanData.origin[node])
            } else {
                hub.scanData.sort.rssi.splice(index, 1, hub.scanData.origin[node])
            }

        }
        addData(node, this.hubs[mac])
    },
    __autoConn(name) {
        const o = this.__selectPerHub(name)
        this.__conn(o)
        this.on('connFin', this.conn())
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
        if (this.connHubs.indeOf(mac) === -1) {
            this.connHubs.push(mac)
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
        this.hubs[mac].status.doing.node = node
        if (this.conning.indexOf(node) === -1) {
            this.conning.push(node)
        }
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

                this.__syncDelScanData(mac, node)
                this.trigger('conn', {
                    mac,
                    node,
                    type,
                    name,
                    data
                })
            },
            always: function () {
                this.hubs[mac].status.doing.node = ''
                this.__delete(node, this.conning)
                this.__delete(mac, this.connHubs)
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
        return !!this.hubs[mac] && this.hubs[mac].status.online || !!this.connetedPeripherals[mac]
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