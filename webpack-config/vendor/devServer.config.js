var path = require('path')
console.log('ddd',  path.join(__dirname, "build"))
module.export = {
  contentBase:  './build',
  host: 'localhost',
  port: 8081, // 默认8080
  inline: true, // 可以监控js变化
  hot: true, // 热启动
  compress: true,
  watchContentBase: false,
};
