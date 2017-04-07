layui.use(['form'], function () {
    module.exports.form = layui.form()
})

//定义全局的hubs变量，存储所有hub的信息
let hubs = {}

export {hubs}