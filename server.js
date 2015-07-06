/**
 * Created by rain on 15/4/7.
 */

var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();

app.set('port', (process.env.PORT || 4000));
app.set('views', __dirname + '/templates');

app.engine('html', require('nunjs').__express);
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, './static')));
//app.use('/', express.static(path.join(__dirname, 'server/data')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


// index
app.get('/vendor', function (req, res) {
    res.render('index', {
        nav: 'OVERVIEW'
    });
});


app.get('/vendor/items', function (req, res) {
    res.render('items');
});



app.get('/vendor/items/:id', function (req, res) {
    if (req.params.id === 'new_item') {
        res.render('new_item');
    }
    else {
        res.render('edit');
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
    res.render('distributors');
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
    res.render('invitation');
});

app.put('/vendor/item_image', function (req, res) {
    res.send({hash: '123'});
});

app.get('/vendor/settings', function (req, res) {
    res.render('settings');
});


app.get('/vendor/login', function (req, res) {
    res.render('login');
});
app.get('/vendor/register', function (req, res) {
    res.render('register');
});
app.get('/vendor/register_next', function (req, res) {
    res.render('register_next');
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
