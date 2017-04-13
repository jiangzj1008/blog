var express = require('express')
var app = express()
var bodyParser = require('body-parser')

// 获取到 ajax 发过来的 json 格式数据
app.use(bodyParser.json())

// 配置静态文件目录
app.use(express.static('static'))

// 导入路由数据
const registerRoutes = function(app, routes) {
    for (var i = 0; i < routes.length; i++) {
        var route = routes[i]
        app[route.method](route.path, route.func)
    }
}

const routeFiles = [
    './route/index',
    './route/blog',
    './route/comment',
]

var registerAll = function(routeFiles) {
    for (var i = 0; i < routeFiles.length; i++) {
        var file = routeFiles[i]
        var r = require(file)
        registerRoutes(app, r.routes)
    }
}

registerAll(routeFiles)

var server = app.listen(80, function() {
    var host = server.address().address
    var port = server.address().port
    console.log("应用实例，访问地址为 http://%s:%s", host, port)
})
