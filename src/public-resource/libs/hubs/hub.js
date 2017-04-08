const api = require('publicDir/libs/api/api')()
var hubConfig = require('../../config/hubConfig.json')
let Hub = function (config) {
    config = config || {}
    let task = []
    const use = function () {
            if (this.info.method === '1') {
                if ($.now() - this.info.tokenTime < this.info.tokenExpire * 1000) {
                    
                } else {
                    api.oauth2(this.info)
                }

            }

            this.next()
            return this
        },
        self = this
    task.push(use)
    this.info = {
        method: config.method || hubConfig.info.method,
        cloundAddress: config.server || hubConfig.info.cloundAddress,
        developer: config.developer || hubConfig.info.developer,
        password: config.password || hubConfig.info.password,
        ip: config.hubIp || '',
        location: config.location,
        mac: config.hubMac,
        token: '',
        tokenExpire: hubConfig.info.tokenExpire,
        tokenTime: 0,
        version: ''
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
            notify: false,
            chip0: {
                connecting: false,
                mac: '' //正在连接设备的mac
            },
            chip1: {
                connecting: false,
                mac: ''
            }
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
    setTimeout(self.next, 0)
}
Hub.prototype.next = function () {
    const fn = this.tasks.shift()
    fn && fn()
}
Hub.prototype.scan = function (o) {
    o = o || {}

}


export default Hub