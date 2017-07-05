import mongoose from "mongoose";
import R from "ramda";
import format from "./format";
let Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const log = R.tap(console.log);

const bindFormat = R.pipe(
  R.props(["type", "format"]),
  R.filter(R.pipe(
    R.isNil,
    R.not
  )),
  format,
  R.objOf("type")
)

const bindRef = R.pipe(
  R.prop("$ref"),
  R.split("/"),
  R.last,
  (ref) => ({type: Schema.Types.ObjectId, ref: ref})
)

const bindArray = R.pipe(
  R.prop("items"),
  R.cond([
    [R.has("$ref"), bindRef],
    [R.propEq("type", "array"), d => bindArray(d)],
    [R.propEq("type", "object"), d => jsonToSchema(d)],
    [R.T, bindFormat],
  ]),
  R.of,
)

const mapProperty = R.pipe(
  R.toPairs,
  R.map(R.adjust(R.cond([
    [R.has("$ref"), bindRef],
    [R.propEq("type", "array"), bindArray],
    [R.T, bindFormat],
  ]), 1))
)

const mapRequired = ([properties, required]) => R.pipe(
  R.map(R.when(
    R.pipe(
      R.prop(0),
      R.contains(R.__, required),
    ),
    R.pipe(
      R.adjust(R.assoc("required", true) ,1),
    )
  )),
  R.fromPairs
)(properties)

const jsonToSchema = R.pipe(
  R.props(["properties", "required"]),
  R.adjust(mapProperty, 0),
  R.adjust(R.cond([
    [R.pipe(R.is(Array), R.not), () => ([])],
    [R.T, R.identity]
  ]) ,1),
  mapRequired
)

export const bindSchema = R.pipe(
  R.prop("definitions"),
  R.toPairs,
  R.filter(R.pipe(
    R.pathOr(false, [1, "x-mongoose", "exclude"]),
    R.not
  )),
  R.map(R.pipe(
    R.adjust(jsonToSchema, 1),
    ([key, schema]) => [key, new Schema(schema)]
  ))
)

export const bindPlugin = plugins => R.forEach(([key, schema]) => {
  if(R.has(key, plugins)){
    schema.plugin(R.prop(key, plugins))
  }
})


export const bindConnect = host => {
  let conn = mongoose.createConnection(host);
  return R.map(([key, schema]) => [key, conn.model(key, schema)])
}
