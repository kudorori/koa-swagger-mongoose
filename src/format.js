import R from "ramda";

const format = {
	"integer":{
		"int32": Number,
		"int64": Number,
		"_default": Number
	},
	"number":{
		"float": Number,
		"double": Number,
		"_default": Number
	},
	"string":{
		"byte": String,
		"binary": String,
		"date": Date,
		"date-time": Date,
		"password": String,
		"_default": String
	},
	"boolean":{
		"_default": Boolean
	}
};

export default R.pipe(
  R.unless(
    R.pipe(
      R.length,
      R.lt(2)
    ),
    R.append("_default")
  ),
  R.path(R.__, format)
)
