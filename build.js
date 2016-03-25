var webpack = require('webpack')
  , webpackConfig = require('./webpack-config')
  , async = require('async')
  , _ = require('lodash')
  , path = require('path')
  , rimraf = require('rimraf')

module.exports = function build (cb) {
  async.series([
    async.apply(rimraf, path.join(__dirname, 'dist'))
  , function (next) {
      var demoConfig = _.defaults({
          context: path.join(__dirname, 'app')
        , entry: path.join(__dirname, 'app', 'index.js')
        , output: {
            path: path.join(__dirname, 'dist')
          , filename: 'app.js'
          , sourceMapFilename: 'app.map.json'
          , pathinfo: process.env.NODE_ENV !== 'production'
          }}, webpackConfig)
        , compiler = webpack(demoConfig)

      compiler.run(next)
    }
  ], cb)
}
