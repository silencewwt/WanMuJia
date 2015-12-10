var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var ProvidePlugin = webpack.ProvidePlugin;
var env = process.env.WEBPACK_ENV;
var fs = require('fs');
var path = require('path');

var entryPath = './app/views';
var outputDir;
var publicPath;
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
    reqwest: 'reqwest',
    Utils: path.join(__dirname, 'app/lib/utils/utils'),
    Header: path.join(__dirname, 'app/lib/components/Header/Header'),
    Footer: path.join(__dirname, 'app/lib/components/Footer/Footer')
  })
];

if (env === 'prev' || env === 'prod') {
  plugins.push(new UglifyJsPlugin({
    test: /(\.jsx|\.js)$/
  }));
  outputDir = '../WanMuJia-fe-release/app';
  if (env === 'prev') {
    publicPath = 'http://static4.wanmujia.com/';
  }
  else {
    publicPath = 'http://static3.wanmujia.com/';
  }
} else {
  outputDir = '../WanMuJia/app';
  publicPath = 'http://localhost:5000/';
}

var config = {
  entry: entries,
  output: {
    path: path.join(__dirname, outputDir, 'static'),
    filename: 'js/user/[name].bundle.js',
    publicPath: publicPath
  },
  module: {
    loaders: [
      {
        test: /(\.jsx|\.js)$/,
        loaders: ['babel?presets[]=es2015&presets[]=react', 'source-map'],
        exclude: /node_modules/
      },
      {
        test: /\.scss$/,
        loaders: ['style?-singleton', 'css?root=' + __dirname, 'autoprefixer', 'resolve-url', 'sass', 'source-map']
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
