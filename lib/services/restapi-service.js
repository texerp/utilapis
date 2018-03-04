'use strict';

var lodash = devebot.require('lodash');

var Service = function(params) {
  params = params || {};
  var self = this;

  var LX = params.loggingFactory.getLogger();
  var LT = params.loggingFactory.getTracer();
  var express = params.webweaverService.express;

  var pluginCfg = params.sandboxConfig;
  var contextPath = pluginCfg.contextPath || '/utilapis';

  self.buildRestRouter = function() {
    var router = express.Router();
    router.route('/qrcode/tick').post(function(req, res, next) {
      LX.has('info') && LX.log('info', LT.add({
        reqBody: req.body
      }).toMessage({
        text: 'Request[{requestId}]: ${reqBody}'
      }));
      setTimeout(function() {
        res.json({
          requestId: params.tracelogService.getRequestId(req),
          type: req.body.type,
          code: req.body.code
        });
      }, lodash.random(100, 2000));
    });
    return router;
  }

  self.getRestRouterLayer = function() {
    return {
      name: 'qrcode-restful-api',
      path: contextPath,
      middleware: self.buildRestRouter()
    };
  }

  if (pluginCfg.autowired !== false) {
    params.webweaverService.push([
      params.webweaverService.getJsonBodyParserLayer([
        params.tracelogService.getTracingBoundaryLayer(),
        params.tracelogService.getTracingListenerLayer(),
        self.getRestRouterLayer()
      ])
    ], pluginCfg.priority);
  }
}

Service.referenceList = [ "tracelogService", "webweaverService" ]

module.exports = Service;
