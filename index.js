var Hapi = require('hapi')
  , glob = require('glob')
  , fs = require('fs')
  , hbs = require('handlebars')
  , inert = require('inert')
  , assert = require('assert')
  , async = require('async')
  , _ = require('lodash')
  , good = require('good')
  , path = require('path')
  , goodConsole = require('good-console')
  , goodOptions = {
      opsInterval: 30000,
      reporters: [{
        reporter: goodConsole,
        events: { log: '*', response: '*' }
      }]
    }
  , build = require('./build')
  , indexTemplateSource = fs.readFileSync('templates/index.hbs').toString()
  , indexTemplate = hbs.compile(indexTemplateSource)
  , server = new Hapi.Server()
  , startedAt = Date.now()
  , logWrap = function logWrap (fn, message) {
      return function (next) {
        fn.apply(null, [function () {
          console.log('  ' + message + ' (' + (Date.now() - startedAt) + 'ms)')

          next.apply(null, Array.prototype.slice.call(arguments))
        }].concat(Array.prototype.slice.call(arguments, 1)))
      }
    }

server.connection({ port: process.env.PORT || 8080 })

console.log('Starting server')

async.auto({
  inert: logWrap(_.bind(server.register, server, inert), 'inert loaded')
, good: logWrap(_.bind(server.register, server, {register: good, options: goodOptions}), 'good loaded')
, assets: logWrap(async.apply(glob, 'assets/*'), 'assets globbed')
, distExists: logWrap(function (next) {
    fs.stat('dist', function (err, stats) {
      next(null, err ? false : stats.isDirectory())
    })
  }, 'checked for dist directory')
, build: ['distExists', logWrap(function (next, results) {
    // Don't rebuild in prod unless dist is missing for some reason
    if (results.distExists && process.env.NODE_ENV === 'production') {
      next()
    }
    else {
      build(next)
    }
  }, 'built app')]
}, function (err, results) {
  assert.ifError(err)

  // Register asset routes
  results.assets.forEach(function (assetPath) {
    server.route({
      method: 'GET',
      path: '/' + assetPath,
      handler: function (request, reply) {
        reply.file(assetPath)
      }
    })
  })

  server.route({
    method: 'GET',
    path: '/app.js',
    handler: function (request, reply) {
      reply.file(path.join(__dirname, 'dist', 'app.js'))
    }
  })

  server.route({
    method: 'GET',
    path: '/app.map.json',
    handler: function (request, reply) {
      reply.file(path.join(__dirname, 'dist', 'app.map.json'))
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply(indexTemplate())
    }
  })

  server.start(function () {
    console.log('Server running at:' + server.info.uri + ' (' + (Date.now() - startedAt) + 'ms)')
  })
})
