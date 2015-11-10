var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var env = process.env.WEBPACK_ENV;
var fs = require('fs');
var path = require('path');

var entryPath = './app/views';
var outputDir;
var plugins = [
  new CommonsChunkPlugin({
    name: "commons"
  })
];

var entries = function () {
  return fs.readdirSync(entryPath).reduce(function (o, filename) {
    !/\./.test(filename) &&
      (o[filename] = './' + path.join(entryPath, filename, filename + '.jsx'));
    return o;
  }, {});
}();

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({
    test: /(\.jsx|\.js)$/
  }));
  outputDir = '../WanMuJia-fe-release/app'
} else {
  outputDir = '../WanMuJia/app';
}

var fileOutputDir = '../../../../' + outputDir;
var config = {
  entry: entries,
  devtool: env === 'build' ? null : 'source-map',
  output: {
    path: path.join(__dirname, outputDir, 'static/js/user'),
    filename: '[name].bundle.js'
    //publicPath: 'http://static.wanmujia.com/js/user/'
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel?presets[]=es2015',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      },
      {
        test: /\.html$/,
        loader: 'file-loader?name=' + fileOutputDir + '/templates/user/' + '[name].[ext]'
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'file-loader?name=' + fileOutputDir + '/static/img/user/' + '[name].[ext]'
      },
      {
        test: /\.(woff?2|otf|eot|svg|ttf)$/i,
        loader: 'file-loader?name=' + fileOutputDir + '/static/fonts/user/' + '[name].[ext]'
      }
    ]
  },
  plugins: plugins
};

module.exports = config;
