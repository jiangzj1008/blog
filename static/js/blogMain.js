var log = console.log.bind(console, '*** ')

var e = function(selector) {
    return document.querySelector(selector)
}

var ajax = function(request) {
    var r = new XMLHttpRequest()
    r.open(request.method, request.url, true)
    if (request.contentType !== undefined) {
        r.setRequestHeader('Content-Type', request.contentType)
    }
    r.onreadystatechange = function(event) {
        if(r.readyState === 4) {
            request.callback(r.response)
        }
    }
    if (request.method === 'GET') {
        r.send()
    } else {
        r.send(request.data)
    }
}

var blogTemplate = function(blog) {
    var id = blog.id
    var title = blog.title
    var author = blog.author
    var content = blog.content
    var d = new Date(blog.created_time * 1000)
    var time = d.toLocaleString()
    var md = new Remarkable()
    var html = md.render(content)
    var t = `
        <div class="blog-cell container" data-id="${id}">
            <div class="blog-title">
                ${title}
            </div>
            <div class="blog-content">
                ${html}
                <div class="content-curtain"></div>
            </div>
            <div class="blog-author">
                <span>${author}</span> @
                <time>${time}</time>
            </div>
        </div>
    `
    return t
}

var insertBlogAll = function(blogs) {
    var html = ''
    for (var i = blogs.length - 1; i >= 0; i--) {
        var b = blogs[i]
        var t = blogTemplate(b)
        html += t
    }
    var div = document.querySelector('.model-blogs')
    div.innerHTML = html
}

var blogAll = function() {
    var request = {
        method: 'GET',
        url: '/api/blog/all',
        contentType: 'application/json',
        callback: function(response) {
            var blogs = JSON.parse(response)
            window.blogs = blogs
            insertBlogAll(blogs)
        }
    }
    ajax(request)
}

// 获取指定文章
var getBlog = function(id) {
    for (var i = 0; i < blogs.length; i++) {
        var blog = blogs[i]
        if (blog.id == id) {
            insertBlog(blog)
        }
    }
}

// 显示所选文章
var insertBlog = function(blog) {
    var t = blogDetailTemplate(blog)
    var div = document.querySelector('.model-blogs')
    div.innerHTML = t
}

// 评论模板
var commentTemplate = function(comments) {
    var t = ''
    for (var i = 0; i < comments.length; i++) {
        var c = comments[i]
        var author = c.author
        var content = c.content
        var d = new Date(c.created_time * 1000)
        var time = d.toLocaleString()
        var md = new Remarkable()
        var html = md.render(content)
        t += `
            <div class="old-comment-cell">
                <p class="old-comment-author">${author}: <span class="old-comment-time">${time}</span></p>
                <p class="old-comment-content">${html}</p>
            </div>
        `
    }
    return t
}

// 文章模板
var blogDetailTemplate = function(blog) {
    var id = blog.id
    var title = blog.title
    var author = blog.author
    var content = blog.content
    var d = new Date(blog.created_time * 1000)
    var time = d.toLocaleString()
    var md = new Remarkable()
    var html = md.render(content)
    var comments = blog.comments
    var cs = commentTemplate(comments)
    var t = `
        <div class="blog-detail-cell container" data-id="${id}">
            <div class="blog-detail-title">
                ${title}
            </div>
            <div class="blog-detail-author">
                <span>${author}</span>
                <br>
                <time>${time}</time>
            </div>
            <div class="blog-detail-content">
                ${html}
            </div>
            <div class="blog-comments">
                <p class="comment-write">发表评论</p>
                <div class='new-comment blog-auto-form' data-key="${id}">
                    <input class='comment-blog-id comment-input' data-key="blog_id" type=hidden value="${id}">
                    <label>
                        <span class="comment-title">作者:</span>
                        <input class='comment-author comment-input' data-key="author" value="">
                    </label>
                    <label>
                        <span class="comment-title">内容:</span>
                        <textarea class='comment-content comment-input' data-key="content" value=""></textarea>
                    </label>
                    <button class='comment-add' data-method="POST" data-path="/api/comment/add">提交</button>
                </div>
                <div class="old-comment">
                    ${cs}
                </div>
            </div>
        </div>
    `
    return t
}

var blogNew = function(form) {
    var data = JSON.stringify(form)
    var request = {
        method: 'POST',
        url: '/api/blog/add',
        data: data,
        contentType: 'application/json',
        callback: function(response) {
            var res = JSON.parse(response)
            blogAll()
        }
    }
    ajax(request)
}

// 添加新评论
var commentNew = function(form, callback) {
    var data = JSON.stringify(form)
    var request = {
        method: 'POST',
        url: '/api/comment/add',
        data: data,
        contentType: 'application/json',
        callback: function(response) {
            console.log('响应', response)
            var res = JSON.parse(response)
            insertComment(res)
            swal('恭喜', '成功添加评论', 'success')
        }
    }
    ajax(request)
}

// 添加博客功能
var bindEventBlogAdd = function () {
    var main = e('.model-blogs')
    main.addEventListener('click', function(event){
        var self = event.target
        if (self.classList.contains('blog-auto-submit')) {
            var form = {
                title: e('#id-input-title').value,
                author: e('#id-input-author').value,
                content: e('#id-input-content').value,
                password: e('#id-input-psw').value
            }
            if(form.password != 'jiang') {
                swal('提示', '密码错误，请联系博主', 'error')
            } else {
                blogNew(form)
                swal('提示', '博客发表成功', 'success')
            }
        }
    })
}

// 显示评论框
var bindEventCommentToggle = function() {
    var main = e('.model-blogs')
    main.addEventListener('click', function(event){
        var self = event.target
        if (self.classList.contains('comment-write')) {
            var commentBox = e('.new-comment')
            if (commentBox.classList.contains('new-comment-hide')) {
                commentBox.classList.remove('new-comment-hide')
            } else {
                commentBox.classList.add('new-comment-hide')
            }
        }
    })
}

// 插入评论
var insertComment = function(form) {
    var arr = [form]
    var t = commentTemplate(arr)
    var oldComment = e('.old-comment')
    oldComment.innerHTML += t
}

// 添加评论
var bindEventCommentAdd = function() {
    var container = e('.model-blogs')
    container.addEventListener('click', function (event) {
        var self = event.target
        if(self.classList.contains('comment-add')) {
            var form = {}
            var commentCell = self.closest('.new-comment')
            var inputs = commentCell.querySelectorAll('.comment-input')
            for(var i = 0; i < inputs.length; i++) {
                var input = inputs[i]
                form[input.dataset.key] = input.value
            }
            commentNew(form, function (comment) {
                log('comment, ', comment)
            })
            var commentInput = e('.new-comment')
            commentInput.classList.remove('new-comment-hide')
        }
    })
}

// 显示博客内容
var bindEventShowBlog = function() {
    var blogs = e('.model-blogs')
    blogs.addEventListener('click', function(event) {
        var target = event.target
        var self = target.closest('.container')
        if (self.classList.contains('blog-cell')) {
            var id = self.dataset.id
            getBlog(id)
        }
    })
}

// 显示添加博客页面
var bindEventShowBlogInput = function() {
    var newBlog = e('.aside-new-blog')
    newBlog.addEventListener('click', function(event) {
        showBlogInput()
    })
}

// 预览功能
var bindEventPreview = function() {
    var input = e('#id-input-content')
    var output = e('#id-output-content')
    input.addEventListener('input', function(event) {
        var md = new Remarkable()
        var src = event.target.value
        var html = md.render(src)
        output.innerHTML = html
    })
}

// 发表博文界面
var showBlogInput = function() {
    var main = e('.model-blogs')
    var t = `
        <div class="blog-auto-form container">
            <div class="blog-input-box">
                <span class="blog-input-title">标题:</span>
                <input id='id-input-title' class="blog-auto-input"  data-key="title" type="text" value="">
            </div>
            <div class="blog-input-box">
                <span class="blog-input-title">作者:</span>
                <input id='id-input-author' class="blog-auto-input"  data-key="author" type="text" value="">
            </div>
            <div class="blog-input-box">
                <span class="blog-input-title">密码:</span>
                <input id='id-input-psw' class="blog-auto-input" data-key="psw" type="password" value="">
            </div>
            <div class="blog-input-box">
                <span class="blog-input-title">内容:</span>
                <textarea id='id-input-content' class="blog-auto-input"  data-key="content" type="text" value=""></textarea>
            </div>
            <div id='id-output-content'></div>
            <button id='id-button-submit' class="blog-auto-submit"
                    data-method="POST"
                    data-path="/api/blog/add"
                    data-response="blogAddBlock"
            >发表新博文</button>
        </div>
    `
    main.innerHTML = t
    bindEventPreview()
}

// 显示所有博文
var bindEventBlogAll = function() {
    var blogs = e('.aside-all-blog')
    blogs.addEventListener('click', function(event) {
        blogAll()
    })
}

var blogAddBlock = function(response) {
    swal('恭喜', '博客发表成功', 'success')
    log('blog add block 回调')
}

var bindEvents = function() {
    bindEventBlogAdd()
    bindEventCommentAdd()
    bindEventShowBlog()
    bindEventCommentToggle()
    bindEventShowBlogInput()
    bindEventBlogAll()
}

var __main = function() {
    // 载入博客列表
    blogAll()
    // 绑定事件
    bindEvents()
}

__main()
