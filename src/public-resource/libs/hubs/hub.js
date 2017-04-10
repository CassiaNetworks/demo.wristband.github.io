const api = require('publicDir/libs/api/api')
var hubConfig = require('../../config/hubConfig.json')
let Hub = function (config) {
    config = config || {}
    this.task = [this.use, this.notify]
    this.output = {
        scan: '',
        notify: ''
    }
    this.info = {
        method: config.method || hubConfig.info.method,
        server: config.server || hubConfig.info.cloundAddress,
        developer: config.developer || hubConfig.info.developer,
        password: config.password || hubConfig.info.password,
        ip: config.hubIp || '',
        location: config.location,
        mac: config.hubMac,
        access_token: '',
        authorization: '',
        tokenExpire: hubConfig.info.tokenExpire,
        tokenTime: 0
    }
    this.config = {
        maxConnected: config.maxConnected || hubConfig.config.maxConnected,
        maxConnected0: config.maxConnected0 || hubConfig.config.maxConnected0,
        maxConnected1: config.maxConnected1 || hubConfig.config.maxConnected1
    }
    this.status = {
        online: false, //hub在线?
        isGettingToken: false, //正在获取token
        chip0Conn: 0, //芯片0连接数量
        chip1Conn: 0,
        doing: { //正在做什么
            scan: 2, //0:芯片0扫描;1:芯片1扫描;2代表停止扫描
            connecting: false,
            mac: '' //正在连接设备的mac
        }
    }
    this.connetedPeripherals = { //已连接设备
        checkConnTime: hubConfig.connetedPeripherals.checkConnTime, //检查连接时间周期
        CheckConnTimeExp: 0, //时间后检查
        Peripherals: { //
            peripheralsMac: {
                mac: '',
                name: '',
                type: '',
                chipId: null, //连接的芯片
                notify: '', //是否通知
                expectedNotify: '', //期望是否通知
                checkNotifyTime: 3, //
                checkNotifyTimeExp: 0 //时间后检查
            }
        }
    }
    setTimeout(this.next, 0)
}
Hub.prototype.use = (function () {
    let times = 1,
        self = this
    return function () {
        if (self.info.method === '1') {
            if ($.now() - self.info.tokenTime > self.info.tokenExpire * 1000 && times < 3) {
                api.oauth2(self.info).done(function () {
                    times = 1
                }).fail(function () {
                    times++
                    self.task.unshift(self.use)
                }).always(function () {
                    self.next()
                })
            }
        } else {
            self.next()
        }
        return self
    }
})()

Hub.prototype.notify = function (toggle) {
    this.status.doing.notify = true
    api.notify(toggle, this)
    // api.on('notify', function () {
    //     notifyHandle.forEach(item => {
    //         item(arguments)
    //     })
    // })
}

Hub.prototype.next = function () {
    const fn = this.tasks.shift()
    fn && fn.apply(this, arguments)
}
Hub.prototype.scan = function (chip) {
    chip = chip || 0
    api.scan(this, chip)

}


Hub.prototype.scan = function (chip) {
    chip = chip || 0
    api.scan(this, chip)

}

Hub.prototype.conn = function (o) {
    api.conn(this, o)

}


export default Hub