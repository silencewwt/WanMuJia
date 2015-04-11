var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.set('port', (process.env.PORT || 3000));
app.set('views', __dirname + '/pages/nunjs');
app.set('view engine', 'nunjs');

app.use('/', express.static(path.join(__dirname, 'modules')));
app.use('/', express.static(path.join(__dirname, 'static')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function (req, res) {
    res.render('index', {
        title: '木一家'
    });
});


app.listen(app.get('port'), function() {
    console.log('Server started: http://localhost:' + app.get('port') + '/');
});
/**
 * Created by rain on 15/4/7.
 */
