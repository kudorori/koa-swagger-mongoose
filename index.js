var mongoose = require("mongoose");
var swaggerParser = require('swagger-parser');
var _ = require("lodash");
var parser = new swaggerParser();
var _path;
var models = {}
var globalSchemaOptions = {};
var lib = {
	parserAPI:function(path){
		return parser.validate(path,{
			$refs: {
			    internal: false   // Don't dereference internal $refs, only external
			}
		})
	},
	initSchema:function(api){
		var definitions = api.definitions;
		
		try{
			globalSchemaOptions = api["x-mongoose"]["schema-options"];
		}catch(e){
			
		}
		
		_.toPairs(definitions).forEach(([name,data])=>{
			if(data["x-mongoose"]!=undefined&&data["x-mongoose"]["exclude"]==true){
				return;
			}
			
			var schema = lib.mapProperty(data);
// 			console.log(data.properties);
			models[name] = mongoose.model(name,new mongoose.Schema(schema,globalSchemaOptions));
		});
	},
	mapProperty:function(property){
		var result = {};
		var required = [];
		var unique = [];
		var index = [];
		if(property["required"]!=undefined){
			required = property["required"];
		}
		
		if(property["x-mongoose"]!=undefined&&property["x-mongoose"]["schema-options"]!=undefined){
			if(property["x-mongoose"]["schema-options"]["unique"]!=undefined){
				unique=property["x-mongoose"]["schema-options"]["unique"];
			}
			if(property["x-mongoose"]["schema-options"]["index"]!=undefined){
				unique=property["x-mongoose"]["schema-options"]["index"];
			}
		}
		_.toPairs(property.properties).forEach(([propertyName,value])=>{
			result[propertyName]=lib.converType(value);
			result[propertyName].required = (required.indexOf(propertyName)!=-1);
			if(unique.indexOf(propertyName)!=-1){
				result[propertyName].index = {unique:true,index:true};
			}else if(index.indexOf(propertyName)!=-1){
				result[propertyName].index = {unique:false,index:true};
			}
			
		});
		return result;
	},
	converType:function(property){
		var result = {};
		if(property.$ref!=undefined){
			var schema = lib.mapProperty(parser.$refs.get(_path+property.$ref));
			return new mongoose.Schema(schema,globalSchemaOptions);
		}
		switch(property.type){
			case "number":
				property.type= Number;
			break;
			case "string":
				property.type= String
			break;
			case "object":
				return lib.mapProperty(property);
			break;
			case "boolean":
				property.type= Boolean
				break;
			case "array":
				return [lib.mapProperty(property.items)]
			break;
		}
		return property;
	}
}


module.exports = function({
	path="",
	host="",
	options={}
}){
	_path = path;
	mongoose.connect(host);
	lib.parserAPI(path).then((api)=>{
		lib.initSchema(api);
		console.log("koa-swagger-mongoose: parser swagger api success");
	}).catch((err)=>{
		console.log(err);
		throw "swagger paser error";
	})
	return (ctx,next)=>{
		ctx.models=models;
		return next();
	}
};
