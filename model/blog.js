var fs = require('fs')

var blogFilePath = 'db/blog.json'

// 用 对象 来存储 Blog 的数据
const ModelBlog = function(form) {
    this.title = form.title || ''
    this.author = form.author || ''
    this.content = form.content || ''
    this.created_time = Math.floor(new Date() / 1000)
}

// 读取 数据库
const loadBlogs = function() {
    var content = fs.readFileSync(blogFilePath, 'utf8')
    var blogs = JSON.parse(content)
    return blogs
}

// 创建 数据库 的 api 集合
var b = {
    data: loadBlogs()
}

b.all = function() {
    var blogs = this.data
    const comment = require('./comment')
    var comments = comment.all()
    for (var i = 0; i < blogs.length; i++) {
        var blog = blogs[i]
        var cs = []
        for (var j = 0; j < comments.length; j++) {
            var c = comments[j]
            if (blog.id == c.blog_id) {
                cs.push(c)
            }
        }
        blog.comments = cs
    }
    return blogs
}

b.new = function(form) {
    var m = new ModelBlog(form)
    // 设置新数据的 id
    var d = this.data[this.data.length-1]
    if (d == undefined) {
        m.id = 1
    } else {
        m.id = d.id + 1
    }
    // 把 数据 加入 this.data 数组
    this.data.push(m)
    // 把 最新数据 保存到文件中
    this.save()
    return m
}

b.delete = function(id) {
    var blogs = this.data
    var found = false
    for (var i = 0; i < blogs.length; i++) {
        var blog = blogs[i]
        if (blog.id == id) {
            found = true
            break
        }
    }
    blogs.splice(i, 1)
    return found
}

b.save = function() {
    var s = JSON.stringify(this.data, null, 2)
    fs.writeFile(blogFilePath, s, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('保存成功')
        }
    })
}

module.exports = b
