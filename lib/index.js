"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _setup = require("./setup");

var _setup2 = _interopRequireDefault(_setup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (apiPath) {
  var mongooseHost = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  var plugin = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var populate = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  var models = [];
  (0, _setup2.default)(apiPath, mongooseHost, plugin, populate).then(function (res) {
    models = res;
  }).catch(function (err) {
    return console.error(err);
  });
  try {
    return async function (ctx, next) {
      ctx.models = models;
      return next();
    };
  } catch (err) {
    throw err;
  }
};