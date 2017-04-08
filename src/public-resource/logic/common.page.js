layui.use(['form'], function () {
    module.exports.form = layui.form()
})

//定义全局的hubs变量，存储所有hub的信息
let hubs = {
    conut: 0,
    timer: null, //检查hub在线定时器
    hubs: {}
}
let peripherals = []


const startWork = function (hubs = {}, peripherals = [], fnArr = []) {
    if (hubs.conut === 0 || peripherals.length === 0) {
        return
    }
    
}





export {
    hubs,
    peripherals,
    startWork
}