// layui.use(['form'], function() {
//     module.exports.form = layui.form()
// })
//
// const hubConfig = require('../config/hubConfig.json')
// 
const DEBUG = false
const bg = (function () {
    if (DEBUG) {
        return {
            log() {
                console.log.apply(console, arguments)
            },
            table() {
                console.table.apply(console, arguments)
            },
            time() {
                console.time.apply(console, arguments)
            },
            timeEnd() {
                console.timeEnd.apply(console, arguments)
            },
            now() {
                console.log.apply(console, $.now().toLocaleTimeString())
            }
        }
    }
    return {
        log() {

        },
        table() {},
        time() {},
        timeEnd() {}
    }
})()
const hubConfig = {
    "info": {
        "method": 0,
        "server": "demo.cassianetworks.com",
        "developer": "tester",
        "password": "10b83f9a2e823c47",
        "tokenExpire": 3000,
        "ip": "",
        "location": "",
        "mac": "",
        "access_token": "",
        "authorization": ""
    },
    "config": {
        "maxConnected": 14,
        "maxConnected0": 7,
        "maxConnected1": 7
    },
    "connetedPeripherals": {
        "checkConnTime": 3
    }
}

function inithub(o) {
    let _inithub = {
        output: {
            scan: '',
            notify: ''
        },
        _escapeTime: {
            token: 0,
            devices: 0,
            scanData: 0,
            clearZombyScanData: 0,
            sortByRssi: 0,
            checkOnline: 0
        },
        scanData: {
            origin: {},
            sort: {
                name: {},
                rssi: []
            }
        },
        info: {
            method: parseInt(o.method || hubConfig.info.method),
            server: 'http://' + o.server || hubConfig.info.cloundAddress,
            developer: o.developer || hubConfig.info.developer,
            password: o.password || hubConfig.info.password,
            interval: hubConfig.info.tokenExpire,
            ip: 'http://' + o.ip || '',
            location: {},
            mac: o.mac,
            access_token: '',
            authorization: ''
        },
        config: {
            maxConnected: o.maxConnected || hubConfig.config.maxConnected,
            maxConnected0: o.maxConnected0 || hubConfig.config.maxConnected0,
            maxConnected1: o.maxConnected1 || hubConfig.config.maxConnected1
        },
        status: {
            online: false, //hub在线?
            conn: 0, //连接数量
            doing: { //正在做什么
                scan: 2, //0:芯片0扫描;1:芯片1扫描;2代表停止扫描
                node: '' //正在连接设备的mac
            }
        },
        connetedPeripherals: { //已连接设备
            checkConnTime: hubConfig.connetedPeripherals.checkConnTime, //检查连接时间周期
            CheckConnTimeExp: 0, //时间后检查
            Peripherals: { //
                // node: {
                //     mac: '',
                //     node: '',
                //     name: '',
                //     type: '',
                //     chipId: null //连接的芯片
                //     // notify: '', //是否通知
                //     // expectedNotify: '', //期望是否通知
                //     // checkNotifyTime: 3, //
                //     // checkNotifyTimeExp: 0 //时间后检查
                // }
            }
        }
    }
    return _inithub
}



//定义全局的hubs变量，存储所有hub的信息
let hubs = {
    conut: 0,
    hubs: {}, //所有hub
    scanHubs: [], //正在扫描的hub
    availableHubs: [], //空闲的hub  没有连接
    conningPers: [], //正在连接的设备
    writeHubs: [], //正在写入的设备
    locationData: {}, //定位信息
    connetedPeripherals: {}, //所有连接的设备
    interval: { //定时任务
        timer: null,
        tasks: []
    },
    target: {
        node: [],
        name: []
    },
    init(mac) {

        const _init = function () {
            this.on('oauth', function (o) {
                this.__changeServer(o.mac)
                debugger
                hubs.__checkOnline(o.mac)
            })
            this.on('online', function (o) {
                hubs.scan(o.mac, 0)
                hubs.notify(o.mac)
                hubs.__intervalTask.call(this)
            })
            this.on('scanData', function (o) {
                hubs.__scanDataColl(o)
            })
            this.on('autoCon', function (o) {
                hubs.__slectHubByName.call(this, o)
                hubs.__slectHubByNode.call(this, o)
            })
            this.on('connByName', hubs.__autoConnByName)
            this.on('connByNode', hubs.__autoConnByNode)
        }
        _.once(_init.bind(this))()
        this.oauth(mac)
        return this
    },
    __changeServer(mac) {
        const info = this.hubs[mac].info
        info.server = info.method ? info.server : info.ip
    },
    add(o = {}) {
        const mac = o.mac

        function _add() {
            if (this.hubs[mac]) {
                throw new Error(`${mac} has existed`)
            } else {
                this.hubs[mac] = inithub(o)
            }
        }

        if (mac === undefined) {
            return
        } else {
            _add.call(this)
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
        if (hub.info.method === 0) {
            if (!option.silent) {
                this.trigger('oauth', {
                    mac

                })
            }
            return this
        }
        $.ajax({
            type: 'post',
            url: hub.info.server + '/oauth2/token',
            headers: {
                'Authorization': 'Basic ' + btoa(hub.info.developer + ':' + hub.info.password)
            },
            data: JSON.stringify({
                'grant_type': 'client_credentials'
            }),
            contentType: 'application/json',
            dataType: 'json',
            context: this,
            success: function (data) {
                hub.info.access_token = data.access_token
                hub.info.tokenExpire = data.expires_in
                hub._escapeTime.token = 0
                hub.info.authorization = 'Bearer ' + data.access_token
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
    __checkOnline(mac) {
        const hub = this.hubs[mac]
        let _url
        if (hub.info.method === 0) {
            _url = hub.info.ip + `/cassia/info/`
        } else {
            _url = hub.info.server + `/cassia/hubs/${mac}`
        }

        $.ajax({
            type: 'get',
            url: _url,
            headers: hub.info.method === 0 ? '' : {
                'Authorization': hub.info.authorization
            },
            context: this,
            dataType: 'json',
            success: function (data) {
                this.hubs[mac]._escapeTime.checkOnline = 0
                this.hubs[mac].status.online = true
                if (hubs.availableHubs.indexOf(mac) === -1)
                    hubs.availableHubs.push(mac)
                this.trigger('online', {
                    mac
                })
            },
            timeout: 5000,
            error: function () {
                this.hubs[mac].status.online = false
                this.__delete(mac, this.availableHubs)
                this.hubs[mac].scanData = {
                    origin: {},
                    sort: {
                        name: {},
                        rssi: []
                    }
                }
                this.hubs[mac].output = {
                    scan: {},
                    notify: {}
                }
                this.trigger('offline', {
                    mac
                })

            }
        })
    },
    scan(mac, chip) {
        chip = chip || 0
        // debugger
        const hub = this.hubs[mac]
        if (!this.__online(mac)) {
            return
        }
        this.__es(hub, 'scan', hub.info.server + '/gap/nodes/?event=1&mac=' + mac + '&chip=' + chip + '&access_token=' + hub.info.access_token,
            function (event) {
                if (hubs.scanHubs.indexOf(mac) === -1) {
                    hubs.scanHubs.push(mac)
                }
                if (event.data.match(/keep-alive/i))
                    return
                hubs.trigger('scanData', {
                    mac,
                    chip,
                    data: JSON.parse(event.data)
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
            this.__es(hub, 'notify', hub.info.server + '/gatt/nodes/?event=1&mac=' + hub.info.mac + '&access_token=' + hub.info.access_token,
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
        const index = Arr.indexOf(item)
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
            fn: this.__checkOnline,
            interval: 60,
            escapeTime: 'checkOnline',
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
            this.__clearOldLoac()
            for (let mac in this.hubs) {
                let hub = this.hubs[mac]
                this.interval.tasks.forEach(function (item) {
                    if (hub._escapeTime[item.escapeTime]++ === item.interval) {
                        item.fn && item.fn.call(this, mac, {
                            silent: item.silent
                        })
                    }
                }, this)
            }
        }.bind(this), 1000)
        return this
    },
    __clearZombyScanData(mac, option) {
        option = option || {
            silent: false
        }
        if (!this.__online(mac)) {
            return
        }
        const origin = this.hubs[mac].scanData.origin
        for (let node in origin) {
            if (origin[node] && origin[node].life-- === 0) {
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
    __clearOldLoac() {
        for (let node in this.locationData) {
            if (this.locationData[node] && this.locationData[node].life === 0) {
                this.locationData[node] = null
            }
        }
    },
    __hubAvailable(mac) {
        if (this.availableHubs.indexOf(mac) === -1) {
            return false
        }
        if (this.hubs[mac].status.conn >= this.hubs[mac].config.maxConnected) {
            console.warn(`hub ${mac} has connected max`)
            this.__delete(mac, this.availableHubs)
            this.trigger('maxConnected', {
                mac
            })
            return false
        }
        return true
    },
    //同步 availableHubs  conningPers connetedPeripherals  hubs[mac].status.doing   hubs[mac]status.conn   
    __conningSyncInfoData(o) {
        console.log(`${o.mac}   开始连接   ${o.name}   ${o.node}`)
        hubs.__delete(o.mac, hubs.availableHubs)
        hubs.conningPers.push(o.node)
        hubs.hubs[o.mac].status.doing.node = o.node
    },
    __connedOkSyncInfoData(o) {
        console.info(`${o.mac}   成功连接   ${o.name}   ${o.node}`)
        hubs.addPer(o)
        hubs.hubs[o.mac].status.conn++
    },
    __connedErrSyncInfoData(o) {
        console.warn(`${o.mac}   失败连接   ${o.name}   ${o.node}`)
        hubs.connetedPeripherals[o.node] = null
        hubs.hubs[o.mac].connetedPeripherals.Peripherals[o.node] = null
    },
    __connedSyncInfoData(o) {
        if (this.availableHubs.indexOf(o.mac) === -1 && this.hubs[o.mac].status.conn < this.hubs[o.mac].config.maxConnected) {
            hubs.availableHubs.push(o.mac)
        }
        hubs.__delete(o.node, hubs.conningPers)
        hubs.hubs[o.mac].status.doing.node = ''
    },

    __syncDelScanData(mac, node) {
        const origin = this.hubs[mac].scanData.origin,
            sort = this.hubs[mac].scanData.sort,
            name = origin[node] ? origin[node].name : ''
        let index

        origin[node] = null
        //删除sort.name中的相应值
        if (sort.name[name]) {
            index = _.findIndex(sort.name[name], function (item) {
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
        bg.time('sortAllRssi')
        option = option || {
            silent: false
        }
        this.hubs[mac].scanData.sort.rssi = _.sortBy(this.hubs[mac].scanData.sort.rssi, (item) => -item.avg)
        for (let name in this.hubs[mac].scanData.sort.name) {
            this.hubs[mac].scanData.sort.name[name] = _.sortBy(this.hubs[mac].scanData.sort.name[name], (item) => -item.avg)
        }
        bg.log(`${new Date().toLocaleTimeString()}  ${mac}   Rssi排序耗时`)
        bg.timeEnd('sortAllRssi')
        // console.clear()
        // bg.table(hubs.hubs[mac].scanData.sort.rssi)
        this.hubs[mac]._escapeTime.sortByRssi = 0
        if (!option.silent) {
            hubs.trigger('sortByRssi')
        }
    },
    __perAvailable(node) {
        if (typeof node === typeof {}) {
            debugger
        }
        return this.conningPers.indexOf(node) === -1 && !this.connetedPeripherals[node]
    },
    /**
     * 
     * 
     * @param {any} [name=[]] 
     * @param {any} [option={}] 
     * @returns 
     */
    __slectHubByName(o, option) {
        option = option || {
            available: true,
            rssiAvg: -80
        }

        //存储当前 所有/可用 hub扫描到的名为 name 的设备
        let availableHubs = this.availableHubs
        const len = availableHubs.length,
            name = o.name
        if (len === 0 || this.target.name.indexOf(name) === -1) {
            return this
        }
        console.log(`发现要连接的设备${name}`)
        let node = this.hubs[availableHubs[0]].scanData.sort.name[name][0]
        if (len === 1 && this.__perAvailable(node.node)) {
            if (this.__hubAvailable(availableHubs[0])) {
                this.trigger('connByName', {
                    [availableHubs[0]]: node
                })
            }

            return this
        }

        let filtedData = {},
            allScanData = [],
            sortByName
        for (let mac of availableHubs) {
            sortByName = this.hubs[mac].scanData.sort.name[name]
            for (let i = 0, len2 = Math.min(len, sortByName.length); i < len2; i++) {
                if (this.__perAvailable(sortByName[i].node) && this.__hubAvailable(mac)) {
                    if (!filtedData[mac])
                        filtedData[mac] = []
                    filtedData[mac].push(sortByName[i])
                }
            }
            allScanData.concat(filtedData[mac])
        }

        let result = {},
            resultNode = []



        for (let i = 0, len = allScanData.length; i < len; i++) {
            node = allScanData[i]
            if (resultNode.length < len && !result[node.mac] && resultNode.indexOf(node.node) === -1) {
                result[node.mac] = node
                resultNode.push(node.node)
            }
        }
        this.trigger('connByName', result)
    },
    __slectHubByNode(node) {
        const mac = node.mac,
            availableHubs = this.availableHubs
        if (this.target.node.indexOf(mac) === 1) {
            return
        }
        if (availableHubs.indexOf(mac) > -1 && this.__perAvailable(node)) {
            this.trigger('connByNode', this.locationData[node])
        }
    },

    // {
    //     mac,
    //     chip,
    //     data: event.data
    // }
    __scanDataColl(o) {
        const node = o.data.bdaddrs[0].bdaddr,
            name = o.data.name,
            rssi = parseInt(o.data.rssi),
            type = o.data.bdaddrs[0].bdaddrType,
            mac = o.mac

        function initNode(node, origin) {
            if (!origin[node]) {
                return {
                    rssi: [],
                    node: '',
                    mac: '',
                    max: -200,
                    min: 0,
                    avg: 0,
                    name: '',
                    type: '',
                    life: 4,
                    times: 0
                }
            }
            return origin[node]
        }

        function addData(node, hub) {

            hub.scanData.origin[node] = initNode(node, hub.scanData.origin)
            let index, _node = hub.scanData.origin[node]
            const len = _node.rssi.push(rssi)
            if (len > 10) {
                _node.rssi.shift()
            }
            _node.node = node
            _node.mac = mac
            _node.max = Math.max(rssi, _node.max)
            _node.min = Math.min(rssi, _node.min)
            _node.avg = parseInt(((_node.avg * (len - 1) + rssi) / len))
            if (!name.match(/unknown/)) {
                _node.name = name
            }
            _node.type = type
            _node.life = 4 //生命周期是4秒
            _node.times++;
            // _node.free = true

            //更新location 数据
            if (!this.locationData[node]) {
                this.locationData[node] = _node
            } else {
                if (this.locationData[node].avg < _node.avg) {
                    this.locationData[node] = _node
                }
            }

            //更新hub.scanData.sort.name值
            const realName = _node.name,
                _name = hub.scanData.sort.name
            if (realName) {
                if (!_name[realName]) {
                    _name[realName] = []
                }
                index = _.findIndex(_name[realName], function (item) {
                    return item.node === node
                })
                if (index === -1) {
                    _name[realName].push(_node)
                } else {
                    _name[realName].splice(index, 1, _node)
                }
            }

            //triggle 发现要链接的name事件
            if (realName) {
                hubs.trigger('autoCon', {
                    node: node,
                    name: realName
                })
            }

            //更新hub.scanData.sort.rssi值
            const _rssi = hub.scanData.sort.rssi
            index = _.findIndex(_rssi, function (item) {
                return item.node === node
            })
            if (index === -1) {
                _rssi.push(hub.scanData.origin[node])
            } else {
                _rssi.splice(index, 1, hub.scanData.origin[node])
            }

        }
        addData.call(this, node, this.hubs[mac])
    },
    __autoConnByName(o) {
        console.log('发现要连接的设备by name', o)
        for (let mac in o) {
            hubs.__conn(o[mac])
        }
    },
    __autoConnByNode(o) {
        console.log('发现要连接的设备by node', o)
        hubs.__conn(o)
    },
    conn(o) {
        o = o || {
            mac: '',
            node: '',
            type: '',
            name: ''
        }
        const mac = o.mac,
            node = o.node,
            type = o.type,
            name = o.name
        if (!mac && node) {
            if (typeof name === 'string' && this.target.name.indexOf(name) === -1)
                this.target.node.push(node)
            else {
                this.target.node = _.union(this.target.node, node)
            }
            return this
        }
        if (mac && node && type) {
            this.__conn(o)
            return this
        }

        if (name && !mac) {
            if (typeof name === 'string' && this.target.name.indexOf(name) === -1)
                this.target.name.push(name)
            else {
                this.target.name = _.union(this.target.name, name)
            }
            return this
        }
        return this
    },
    __conn(o) {
        const hub = this.hubs[o.mac],
            mac = o.mac,
            node = o.node,
            type = o.type,
            name = o.name
        this.__conningSyncInfoData(o)
        $.ajax({
            type: 'post',
            url: hub.info.server + '/gap/nodes/' + o.node + '/connection?mac=' + o.mac,
            headers: hub.info.method === 0 ? '' : {
                'Authorization': hub.info.authorization
            },
            data: {
                "type": o.type || "public"
            },
            // dataType:'json',
            // contentType:'application/json',
            context: this,
            success: function (data) {
                this.__connedOkSyncInfoData(o)
                this.__syncDelScanData(mac, node)
                this.trigger('conn', {
                    mac,
                    node,
                    type,
                    name,
                    data
                })
            },
            error: function () {
                this.__connedErrSyncInfoData(o)
            },
            complete: function () {
                console.info(`${mac}可用`)
                this.__connedSyncInfoData(o)
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
            headers: hub.info.method === 0 ? '' : {
                'Authorization': hub.info.authorization
            },
            context: this,
            success: function (data) {
                this.removePer({
                    mac,
                    node
                })
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
        hubs.connetedPeripherals[o.node] = o
        hubs.hubs[o.mac].connetedPeripherals.Peripherals[o.node] = o
        return this
    },
    removePer(o) {
        hubs.connetedPeripherals[o.node] = null
        hubs.hubs[o.mac].connetedPeripherals.Peripherals[o.node] = null
        return this
    },
    devices(mac, option) {
        option = option || {
            silent: false
        }
        const hub = this.hubs[mac]
        if (!this.__online(mac)) {
            return
        }
        $.ajax({
            type: 'get',
            url: hub.info.server + '/gap/nodes/?connection_state=connected&mac=' + mac,
            headers: hub.info.method === 0 ? '' : {
                'Authorization': hub.info.authorization
            },
            context: this,
            dataType:'application/json',
            success: function (data) {
                const nodes = data.nodes
                this.hubs[mac].status.conn = nodes.length
                const nodeList = _.pluck(nodes, 'id')
                for (let item of nodes) {
                    const node = item.id,
                        chip = item.chipId
                    if (!this.hubs[mac].connetedPeripherals.Peripherals[node])
                        this.addPer({
                            node,
                            mac,
                            chip,
                            name: hubs.locationData[node] ? hubs.locationData[node].name : item.name,
                            type: ''
                        })
                    else {
                        this.hubs[mac].connetedPeripherals.Peripherals[node].chip = chip
                        this.connetedPeripherals[node].chip = chip
                    }
                }
                for (let item in this.connetedPeripherals) {
                    const node = item
                    if (nodeList.indexOf(node) === -1) {
                        this.removePer({
                            mac,
                            node
                        })
                    }
                }
                if (!option.silent) {
                    this.trigger('devices', {
                        mac,
                        nodes
                    })
                }
            }
        })
        // this.hubs[mac]._escapeTime.devices = 0
        return this
    },
    __online(mac) {
        return !!this.hubs[mac] && this.hubs[mac].status.online || !this.connetedPeripherals[mac]
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
            headers: hub.info.method === 0 ? '' : {
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
            headers: hub.info.method === 0 ? '' : {
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

const hub1 = {
    "method": 0,
    "server": "demo.cassianetworks.com",
    "developer": "tester",
    "password": "10b83f9a2e823c47",
    "tokenExpire": 3000,
    "ip": "192.168.1.134",
    "mac": "CC:1B:E0:E0:26:F8"
}

const hub2 = {
    "method": 0,
    "server": "demo.cassianetworks.com",
    "developer": "tester",
    "password": "10b83f9a2e823c47",
    "tokenExpire": 3000,
    "ip": "192.168.1.129",
    "mac": "CC:1B:E0:E0:1D:0C"
}

hubs.add(hub2).init(hub2.mac)
hubs.add(hub1).init(hub1.mac).conn({
    name: ['HW330-0000001', 'CassiaFD_1.2', 'HW-0000001']
})

// const startWork = function (hubs = {}, peripherals = []) {
//     if (hubs.conut === 0 || peripherals.length === 0) {
//         return
//     }

// }



// export {
//     hubs,
//     peripherals,
//     startWork
// }