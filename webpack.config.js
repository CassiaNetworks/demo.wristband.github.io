var path = require('path')
var webpack = require('webpack')
var precss = require('precss');
var autoprefixer = require('autoprefixer');

var commonsChunkPlugin = new webpack.optimize.CommonsChunkPlugin({
    name: 'commons', // 这公共代码的chunk名为'commons'
    filename: '[name].bundle.js', // 生成后的文件名，虽说用了[name]，但实际上就是'commons.bundle.js'了
    minChunks: 4, // 设定要有4个chunk（即4个页面）加载的js模块才会被纳入公共代码。这数目自己考虑吧，我认为3-5比较合适。
});
var providePlugin = new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    'window.jQuery': 'jquery',
    'window.$': 'jquery',
});
module.exports = {
    entry: {
        'pages/sport': path.resolve(__dirname, './src/pages/sport/page')
    },
    output: {
        path: path.resolve(__dirname, './build'),
        publicPath: path.resolve(__dirname, './build'),
        filename: '[name]/entry.js',
        chunkFilename: '[id].bundle.js'
    },
    module: {
        loaders: [{
                test: /\.css$/,
                exclude: /node_modules/,
                loader: 'css?minimize&-autoprefixer!postcss'
            },
            {
                test: /\.js$/,
                exclude: /node_modules|vendor/,
                loader: 'babel-loader'
            }, {
                test: require.resolve('jquery'), // 此loader配置项的目标是NPM中的jquery
                loader: 'expose?$!expose?jQuery' // 先把jQuery对象声明成为全局变量`jQuery`，再通过管道进一步又声明成为全局变量`$`
            }
        ],
        postcss: function () {
            return [precss, autoprefixer({
                remove: false,
                browsers: ['ie >= 8', '> 1% in CN'],
            })];
        }
    },

    plugin: [commonsChunkPlugin, providePlugin]
}


var baseModel = {
    
}