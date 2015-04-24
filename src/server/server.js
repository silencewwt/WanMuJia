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


app.get('/', function (req, res) {

    fs.exists('src/server/data/index_data.json', function (exists) {
        if (exists) {
            fs.readFile('src/server/data/index_data.json', function (err, data) {
                if (err) {
                    return console.log(err);
                }

                var _data = JSON.parse(data);
                res.render('index', {
                    title: '首页',
                    new_items: _data.new_items,
                    hot_items: _data.hot_items,
                    the_masters: _data.the_masters
                });
            });
        }
        else {
            res.send('Something Error!');
        }
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
