import R from "ramda";
import setup from "./setup";

export default (apiPath, mongooseHost = "", plugin = {}, populate = false) => {
  let models = [];
  setup(apiPath, mongooseHost, plugin, populate).then(res => {
    models = res;
  }).catch(err => console.error(err));
  try{
    return async(ctx, next) => {
      ctx.models = models;
      return next();
    }
  }catch(err){
    throw err;
  }
}
