"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _swaggerParser = require("swagger-parser");

var _swaggerParser2 = _interopRequireDefault(_swaggerParser);

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _ramda2.default.tap(console.log);

var parserAPI = function parserAPI(populate) {
  return async function (path) {
    return await _swaggerParser2.default.validate(path, {
      $refs: {
        internal: populate
      }
    });
  };
};

var setup = function setup(apiPath, mongooseHost, plugins, populate) {
  return _ramda2.default.pipeP(parserAPI(populate), _ramda2.default.tap(_ramda2.default.pipe(_ramda2.default.path(["definitions", "test12313", "properties"]))), _util.bindSchema, (0, _util.bindPlugin)(plugins), (0, _util.bindConnect)(mongooseHost), _ramda2.default.fromPairs)(apiPath);
};

exports.default = setup;