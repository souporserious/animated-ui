const path = require('path')
const webpack = require('webpack')
var TARGET = process.env.TARGET || null

const externals = {
  react: {
    root: 'React',
    commonjs2: 'react',
    commonjs: 'react',
    amd: 'react',
  },
}

const config = {
  entry: {
    index: './src/index.js',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: 'dist/',
    filename: 'animated-ui.js',
    sourceMapFilename: 'animated-ui.sourcemap.js',
    library: 'AnimatedUI',
    libraryTarget: 'umd',
  },
  module: {
    rules: [{ test: /\.(js|jsx)/, loader: 'babel-loader' }],
  },
  plugins: [],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  externals: externals,
}

if (TARGET === 'minify') {
  config.output.filename = 'animated-ui.min.js'
  config.output.sourceMapFilename = 'animated-ui.min.js'
  config.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
      },
      mangle: {
        except: ['React'],
      },
    })
  )
}

module.exports = config
