"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bindConnect = exports.bindPlugin = exports.bindSchema = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

var _format = require("./format");

var _format2 = _interopRequireDefault(_format);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Schema = _mongoose2.default.Schema;
_mongoose2.default.Promise = global.Promise;

var log = _ramda2.default.tap(console.log);

var bindFormat = _ramda2.default.pipe(_ramda2.default.props(["type", "format"]), _ramda2.default.filter(_ramda2.default.pipe(_ramda2.default.isNil, _ramda2.default.not)), _format2.default, _ramda2.default.objOf("type"));

var bindRef = _ramda2.default.pipe(_ramda2.default.prop("$ref"), _ramda2.default.split("/"), _ramda2.default.last, function (ref) {
  return { type: Schema.Types.ObjectId, ref: ref };
});

var bindArray = _ramda2.default.pipe(_ramda2.default.prop("items"), _ramda2.default.cond([[_ramda2.default.has("$ref"), bindRef], [_ramda2.default.propEq("type", "array"), function (d) {
  return bindArray(d);
}], [_ramda2.default.propEq("type", "object"), function (d) {
  return jsonToSchema(d);
}], [_ramda2.default.T, bindFormat]]), _ramda2.default.of);

var mapProperty = _ramda2.default.pipe(_ramda2.default.toPairs, _ramda2.default.map(_ramda2.default.adjust(_ramda2.default.cond([[_ramda2.default.has("$ref"), bindRef], [_ramda2.default.propEq("type", "array"), bindArray], [_ramda2.default.T, bindFormat]]), 1)));

var mapRequired = function mapRequired(_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      properties = _ref2[0],
      required = _ref2[1];

  return _ramda2.default.pipe(_ramda2.default.map(_ramda2.default.when(_ramda2.default.pipe(_ramda2.default.prop(0), _ramda2.default.contains(_ramda2.default.__, required)), _ramda2.default.pipe(_ramda2.default.adjust(_ramda2.default.assoc("required", true), 1)))), _ramda2.default.fromPairs)(properties);
};

var jsonToSchema = _ramda2.default.pipe(_ramda2.default.props(["properties", "required"]), _ramda2.default.adjust(mapProperty, 0), _ramda2.default.adjust(_ramda2.default.cond([[_ramda2.default.pipe(_ramda2.default.is(Array), _ramda2.default.not), function () {
  return [];
}], [_ramda2.default.T, _ramda2.default.identity]]), 1), mapRequired, log);

var bindSchema = exports.bindSchema = _ramda2.default.pipe(_ramda2.default.prop("definitions"), _ramda2.default.toPairs, _ramda2.default.filter(_ramda2.default.pipe(_ramda2.default.pathOr(false, [1, "x-mongoose", "exclude"]), _ramda2.default.not)), _ramda2.default.map(_ramda2.default.pipe(_ramda2.default.adjust(jsonToSchema, 1), function (_ref3) {
  var _ref4 = _slicedToArray(_ref3, 2),
      key = _ref4[0],
      schema = _ref4[1];

  return [key, new Schema(schema)];
})));

var bindPlugin = exports.bindPlugin = function bindPlugin(plugins) {
  return _ramda2.default.forEach(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
        key = _ref6[0],
        schema = _ref6[1];

    if (_ramda2.default.has(key, plugins)) {
      schema.plugin(_ramda2.default.prop(key, plugins));
    }
  });
};

var bindConnect = exports.bindConnect = function bindConnect(host) {
  var conn = _mongoose2.default.createConnection(host);
  return _ramda2.default.map(function (_ref7) {
    var _ref8 = _slicedToArray(_ref7, 2),
        key = _ref8[0],
        schema = _ref8[1];

    return [key, conn.model(key, schema)];
  });
};