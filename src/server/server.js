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
        res.render('user/index', {
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
        res.render('user/display', {
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
        res.render('user/details', {
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
        res.render('user/compare', {
            title: '商品比较页',
            item: _data
        });
    });
});

app.get('/address', function (req, res) {
    res.render('user/address', {
        title: '选择地址'
    });
});


// user
app.get('/user/login', function (req, res) {
    res.render('user/login_user', {
        title: '用户登录'
    });
});

app.get('/user/register', function (req, res) {
    res.render('user/register_user', {
        title: '新用户注册'
    });
});

app.post('/user/register', function (req, res) {
    res.render('user/register_user_next', {
        title: '新用户注册'
    });
});

app.post('/user/register/result', function (req, res) {
    res.render('user/register_result', {
        title: '注册成功',
        result: '注册成功',
        username: req.param.mobile,
        nickname: req.param.nickname
    });
});

app.get('/user/profile', function (req, res) {
    fs.readFile('src/server/data/index_data.json', function (err, data) {
        if (err) {
            console.log(err);
            res.send('Something Error!');
        }

        var _data = JSON.parse(data);
        res.render('user/profile', {
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


// vendor
app.get('/vendor', function (req, res) {
    res.render('vendor/index', {
        nav: 'OVERVIEW'
    });
});

app.get('/vendor/items', function (req, res) {
    res.render('vendor/items');
});

app.get('/vendor/items/:id', function (req, res) {
    if (req.params.id === 'new_item') {
        res.render('vendor/new_item');
    }
    else {
        res.render('vendor/edit');
    }
});

app.post('/vendor/items/:id', function (req, res) {
    if (req.params.id === 'new_item') {
        res.send('new');
    }
    else {
        res.send('edit');
    }
});


app.get('/vendor/distributors', function (req, res) {
    res.render('vendor/distributors');
});

app.get('/vendor/distributors/datatable', function (req, res) {
    res.send({
        "draw": 2,
        "recordsTotal": 3,
        "recordsFiltered": 3,
        "data": [
            {
                "id": 1,
                "name": "Troy",
                "address": "Young",
                "contact_mobile": "110",
                "contact": "PR",
                "created": "20150624"
            },
            {
                "id": 2,
                "name": "Troy",
                "address": "Young",
                "contact_mobile": "110",
                "contact": "PR",
                "created": "20150624"
            },
            {
                "id": 3,
                "name": "Troy",
                "address": "Young",
                "contact_mobile": "110",
                "contact": "PR",
                "created": "20150624"
            }
        ]
    });
});

app.get('/vendor/distributors/invitation', function (req, res) {
    res.render('vendor/invitation');
});

app.put('/vendor/item_image', function (req, res) {
    res.send({hash: '123'});
});

app.get('/vendor/settings', function (req, res) {
    res.render('vendor/settings');
});


app.get('/vendor/login', function (req, res) {
    res.render('vendor/login');
});
app.get('/vendor/register', function (req, res) {
    res.render('vendor/register');
});
app.get('/vendor/register_next', function (req, res) {
    res.render('vendor/register_next');
});


// 404
app.use(function(req, res){
    res
        .status(404)
        .render('user/404', {
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
