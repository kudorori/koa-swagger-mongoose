"use strict";

var _ = require("../");

var _2 = _interopRequireDefault(_);

var _koa = require("koa");

var _koa2 = _interopRequireDefault(_koa);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = new _koa2.default();
app.use((0, _2.default)(__dirname + "/api.yaml", "mongodb://root:root@ds145379.mlab.com:45379/restful_test", {
  user: function user(schema, options) {
    // console.log(schema, "plugin")
  }
}, false));

app.use(async function (ctx, next) {
  var user = ctx.models.user;

  ctx.body = await user.find();
});

app.listen(9999);