import R, {adjust} from "ramda";
import mongoose from "mongoose";
import swaggerParser from "swagger-parser";
import {
  bindSchema,
  bindPlugin,
  bindConnect
} from "./util";

const log = R.tap(console.log);

const parserAPI = populate => async path => await swaggerParser.validate(path, {
  $refs: {
    internal: populate
  }
});

const setup = (apiPath, mongooseHost, plugins, populate) => R.pipeP(
  parserAPI(populate),
  R.tap(R.pipe(
    R.path(["definitions", "test12313", "properties"]),
  )),
  bindSchema,
  bindPlugin(plugins),
  bindConnect(mongooseHost),
  R.fromPairs
)(apiPath);


export default setup;
