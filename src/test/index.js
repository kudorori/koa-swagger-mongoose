import swaggerModel from "../";
import koa from "koa";

let app = new koa();
app.use(swaggerModel(`${__dirname}/api.yaml`, "mongodb://root:root@ds145379.mlab.com:45379/restful_test", {
  user: (schema, options) => {
    // console.log(schema, "plugin")
  }
}, false))

app.use(async(ctx, next) => {
  const {user} = ctx.models;
  ctx.body = await user.find();

})

app.listen(9999);
