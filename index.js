var mongoose = require("mongoose");
var swaggerParser = require('swagger-parser');
var _ = require("lodash");
var parser = new swaggerParser();
var _path;
var _mongooseForPath = {};
var _modelsForPath = {};
var _pathCache = [];
var init = false;
var globalSchemaOptions = {};
var lib = {
	parserAPI:function(path){
		return parser.validate(path,{
			$refs: {
			    internal: false   // Don't dereference internal $refs, only external
			}
		})
	},
	initSchema:function({
		path,
		api,
		overwrite
	}){
		return new Promise((resolve)=>{
			var definitions = api.definitions;
			var models = {};
			try{
				globalSchemaOptions = api["x-mongoose"]["schema-options"];
			}catch(e){
				
			}
			
			_.toPairs(definitions).forEach(([name,data])=>{
				if(data["x-mongoose"]!=undefined&&data["x-mongoose"]["exclude"]==true){
					return;
				}
				
				var schemaData = lib.mapProperty(data);
				var schema = new mongoose.Schema(schema,globalSchemaOptions);
				if(overwrite[name]!=undefined){
					console.log("overwrite");
					schema = new overwrite[name](schema);
				}
				
				models[name] = _mongooseForPath[path].model(name,schema);
			});
			resolve(models);
		})
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
	overwrite={},
	options={}
}){
	if(_pathCache.indexOf(path)==-1){
		_pathCache.push(path);
		try{
			_mongooseForPath[path] = mongoose.createConnection(host);
		}catch(e){
			
		}
		
		lib.parserAPI(path).then((api)=>{
			return lib.initSchema({
				path:path,
				api:api,
				overwrite:overwrite
			});
			console.log("koa-swagger-mongoose: parser swagger model success");
		}).then((models)=>{
			_modelsForPath[path]=models;
		}).catch((err)=>{
			console.log(err);
			throw "swagger paser error";
		});
	}
	
	
	return (ctx,next)=>{
		console.log(path);
		ctx.models=_modelsForPath[path];
		return next();
	}
};