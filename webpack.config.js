var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var ProvidePlugin = webpack.ProvidePlugin;
var env = process.env.WEBPACK_ENV;
var fs = require('fs');
var path = require('path');

var entryPath = './app/views';
var outputDir;
var entries = function () {
  return fs.readdirSync(entryPath).reduce(function (o, filename) {
    !/\./.test(filename) &&
    (o[filename] = './' + path.join(entryPath, filename, filename + '.jsx'));
    return o;
  }, {});
}();

var plugins = [
  new CommonsChunkPlugin({
    name: "commons"
  }),
  new ProvidePlugin({
    React: 'react',
    ReactDOM: 'react-dom',
    Ajax: 'reqwest',
    Utils: '/app/lib/utils/utils',
    Header: path.join(__dirname, 'app/lib/components/Header/Header'),
    Footer: path.join(__dirname, 'app/lib/components/Footer/Footer')
  })
];

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({
    test: /(\.jsx|\.js)$/
  }));
  outputDir = '../WanMuJia-fe-release/app'
} else {
  outputDir = '../WanMuJia/app';
}

var config = {
  entry: entries,
  devtool: env === 'build' ? null : 'source-map',
  output: {
    path: path.join(__dirname, outputDir, 'static'),
    filename: 'js/user/[name].bundle.js',
    publicPath: env === 'build' ?  'http://static.wanmujia.com/' : 'http://localhost:5000/'
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel?presets[]=es2015&presets[]=react',
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css?root=' + __dirname, 'resolve-url', 'sass']
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/,
        loader: 'file-loader?name=img/user/[name].[ext]'
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.html$/,
        loader: 'file-loader?name=../templates/user/[name].[ext]'
      },
      {
        test: /\.(woff2?|otf|eot|svg|ttf)$/i,
        loader: 'file-loader?name=fonts/user/[name].[ext]'
      }
    ]
  },
  plugins: plugins,
  resolve: {
    root: __dirname,
    extensions: ['', '.js', '.jsx']
  }
};

module.exports = config;
