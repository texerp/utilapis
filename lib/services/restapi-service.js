'use strict';

var lodash = devebot.require('lodash');
var util = require('util');

var Service = function(params) {
  params = params || {};
  var self = this;

  var LX = params.loggingFactory.getLogger();
  var LT = params.loggingFactory.getTracer();
  var express = params.webweaverService.express;

  var pluginCfg = params.sandboxConfig;
  var contextPath = pluginCfg.contextPath || '/utilapis';

  var validateQrcodeData = function(req, res) {
    var data = req.body;
    if (lodash.isObject(data)) {
      var failedFields = [];
      ['code', 'type'].forEach(function(fieldName) {
        if (lodash.isEmpty(data[fieldName])) {
          failedFields.push(fieldName);
        }
      });
      if (!lodash.isEmpty(failedFields)) {
        res.status(401).json({
          message: util.format('[%s] field(s) must not be null', failedFields.join(','))
        });
        return false;
      }
    } else {
      res.status(401).json({
        message: 'body must be a JSON object'
      });
      return false;
    }
    if (process.env.TEXERP_UTILAPIS_RANDOM_FAILURE) {
      var freq = parseInt(process.env.TEXERP_UTILAPIS_RANDOM_FAILURE);
      if (freq > 0) {
        if (lodash.random(freq) === Math.floor(freq/2)) {
          res.status(401).json({
            message: 'Random failure occurred'
          });
          return false;
        }
      }
    }
    return true;
  }

  self.buildRestRouter = function() {
    var router = express.Router();
    router.route('/qrcode/tick').post(function(req, res, next) {
      LX.has('info') && LX.log('info', LT.add({
        requestId: params.tracelogService.getRequestId(req),
        reqBody: req.body
      }).toMessage({
        text: 'Request[${requestId}]: ${reqBody}'
      }));
      if (validateQrcodeData(req, res)) {
        setTimeout(function() {
          res.json({
            requestId: params.tracelogService.getRequestId(req),
            type: req.body.type,
            code: req.body.code
          });
        }, lodash.random(100, 2000));
      }
    });
    return router;
  }

  self.getRestRouterLayer = function() {
    return {
      name: 'utilapis-qrcode-api',
      path: contextPath,
      middleware: self.buildRestRouter()
    };
  }

  if (pluginCfg.autowired !== false) {
    params.webweaverService.push([
      params.webweaverService.getJsonBodyParserLayer([
        params.tracelogService.getTracingListenerLayer(),
        self.getRestRouterLayer()
      ])
    ], pluginCfg.priority);
  }
}

Service.referenceList = [ "tracelogService", "webweaverService" ]

module.exports = Service;
