var gutil = require('gulp-util');
var webpack = require("webpack");
var WebpackDevServer = require("webpack-dev-server");
var webpackConfig = null;

webpackConfig = require("./webpack.config.js");

var devServer = new WebpackDevServer(webpack(webpackConfig), {
  contentBase: './public/',
  hot: true,
  watchOptions: {
    aggregateTimeout: 100
  },
  noInfo: true
});
devServer.listen(9090, "0.0.0.0", function(err) {
  if (err) {
    throw new gutil.PluginError("webpack-dev-server", err);
  }
  gutil.log("[webpack-dev-server]", "http://localhost:9090");
});