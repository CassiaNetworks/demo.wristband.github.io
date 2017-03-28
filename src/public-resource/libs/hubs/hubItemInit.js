var hubConfig = require('../../config/hubConfig.json')
const hubitemInit = function (hubConfig) {
    return ({
        info: {
            cloundAddress: hubConfig.info.cloundAddress,
            developer: hubConfig.info.developer,
            password: hubConfig.info.password,
            token: '',
            tokenExpire: hubConfig.info.tokenExpire,
            tokenTime: 0,
            version: '',
            ip: '',
            mac: ''
        },
        config: {
            maxConnected: hubConfig.config.maxConnected,
            maxConnected0: hubConfig.config.maxConnected0,
            maxConnected1: hubConfig.config.maxConnected1
        },
        status: {
            online: false, //hub在线?
            isGettingToken: false, //正在获取token
            chip0Conn: 0, //芯片0连接数量
            chip1Conn: 0,
            doing: { //正在做什么
                scan: 2, //0:芯片0扫描;1:芯片1扫描;2代表停止扫描
                notify: false,
                chip0: {
                    connecting: false,
                    mac: ''
                },
                chip1: {
                    connecting: false,
                    mac: ''
                }
            }
        },
        connetedPeripherals: { //已连接设备
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
    })
}

exports = hubitemInit(hubConfig)