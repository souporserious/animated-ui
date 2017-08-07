const path = require('path');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')

module.exports = {
  entry:  './example/index.jsx',
  output: {
    path: path.resolve(__dirname, 'example'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      { test: /\.(js|jsx)/, loader: 'babel-loader' },
      { test: /\.scss$/, loader: 'style!css!postcss!sass?sourceMap' }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devtool: 'eval',
  devServer: {
    host: 'localhost',
    contentBase: [path.join(__dirname, '/'), path.join(__dirname, 'example')],
    historyApiFallback: true,
    compress: true,
    inline: true,
    hot: true,
    watchContentBase: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: './example/index.html'
    }),
    new webpack.HotModuleReplacementPlugin()
  ]
};
