/**
 * Created by rain on 15/4/7.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();

app.set('port', (process.env.PORT || 3000));
app.set('views', __dirname + '/pages');

app.engine('html', require('nunjs').__express);
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, './static')));
//app.use('/', express.static(path.join(__dirname, 'server/data')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// index
app.get('/', function (req, res) {

    fs.readFile('src/server/data/index_data.json', function (err, data) {
        if (err) {
            console.log(err);
            res.send('Something Error!');
        }

        var _data = JSON.parse(data);
        res.render('index', {
            title: '首页',
            new_items: _data.new_items,
            hot_items: _data.hot_items,
            the_masters: _data.the_masters
        });
    });

});

app.get('/display', function (req, res) {
    fs.readFile('src/server/data/index_data.json', function (err, data) {
        if (err) {
            console.log(err);
            res.send('Something Error!');
        }

        var _data = JSON.parse(data);
        res.render('display', {
            title: '分类展示页',
            items: _data.new_items
        });
    });
});

app.get('/item', function (req, res) {
    fs.readFile('src/server/data/item01.json', function (err, data) {
        if (err) {
            console.log(err);
            res.send('Something Error!');
        }

        var _data = JSON.parse(data);
        res.render('details', {
            title: '详情展示页',
            item: _data
        });
    });
});

app.get('/compare', function (req, res) {
    fs.readFile('src/server/data/item01.json', function (err, data) {
        if (err) {
            console.log(err);
            res.send('Something Error!');
        }

        var _data = JSON.parse(data);
        res.render('compare', {
            title: '商品比较页',
            item: _data
        });
    });
});

app.get('/address', function (req, res) {
    res.render('address', {
        title: '选择地址'
    });
});


// user
app.get('/user/login', function (req, res) {
    res.render('login_user', {
        title: '用户登录'
    });
});

app.get('/user/register', function (req, res) {
    res.render('register_user', {
        title: '新用户注册'
    });
});

app.post('/user/register', function (req, res) {
    res.render('register_user_next', {
        title: '新用户注册'
    });
});

app.post('/user/register/result', function (req, res) {
    res.render('register_result', {
        title: '注册成功',
        result: '注册成功',
        username: req.param.mobile,
        nickname: req.param.nickname
    })
});

app.get('/user/profile', function (req, res) {
    fs.readFile('src/server/data/index_data.json', function (err, data) {
        if (err) {
            console.log(err);
            res.send('Something Error!');
        }

        var _data = JSON.parse(data);
        res.render('profile', {
            title: '用户个人中心',
            items: _data.new_items,
            info: {
                nickname: 'BossXu',
                name: '徐巍',
                email: 'bossxu@gmail.com',
                mobile_phone: 110,
                address: '长安街1号'
            }
        });
    });
});


// vender
app.get('/vender/login', function (req, res) {
    res.render('login_vender', {
        title: '厂家登录'
    });
});
app.get('/vender/register', function (req, res) {
    res.render('register_vender', {
        title: '厂家注册'
    });
});

app.post('/vender/register', function (req, res) {
    res.render('register_vender_next', {
        title: '厂家注册'
    });
});



app.use(function(req, res){
    res
        .status(404)
        .render('404', {
            title: '页面未找到'
        });
});


// 在开发环境下输出日志和错误信息
if (app.get('env') === 'development') {
    app.set('showStackError', true);
    app.use(morgan(':method :url :status'));
    app.locals.pretty = true;
}

app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});
