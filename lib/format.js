"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _ramda = require("ramda");

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var format = {
	"integer": {
		"int32": Number,
		"int64": Number,
		"_default": Number
	},
	"number": {
		"float": Number,
		"double": Number,
		"_default": Number
	},
	"string": {
		"byte": String,
		"binary": String,
		"date": Date,
		"date-time": Date,
		"password": String,
		"_default": String
	},
	"boolean": {
		"_default": Boolean
	}
};

exports.default = _ramda2.default.pipe(_ramda2.default.unless(_ramda2.default.pipe(_ramda2.default.length, _ramda2.default.lt(2)), _ramda2.default.append("_default")), _ramda2.default.path(_ramda2.default.__, format));