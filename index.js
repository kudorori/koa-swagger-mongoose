var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var swaggerParser = require('swagger-parser');
var _ = require("lodash");
var parser = new swaggerParser();
var _path;
var _mongooseForPath = {};
var _modelsForPath = {};
var _pathCache = [];
var init = false;
var globalSchemaOptions = {};
var _format = {
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
}

mongoose.Promise = global.Promise;

var lib = {
	parserAPI:function(path, populate){
		return parser.validate(path,{
			$refs: {
		    internal: populate   // Don't dereference internal $refs, only external
		  }
		})
	},
	initSchema:function({
		path,
		api,
		overwrite
	}){
		return new Promise((resolve,reject)=>{
			var definitions = api.definitions;
			var models = {};
			try{
				globalSchemaOptions = api["x-mongoose"]["schema-options"];
			}catch(e){
				
			}
			
			_.toPairs(JSON.parse(JSON.stringify(definitions))).forEach(([name,data])=>{
				if(data["x-mongoose"]!=undefined&&data["x-mongoose"]["exclude"]==true){
					return;
				}
				var schemaData = lib.mapProperty(data);
				
				var schema = new mongoose.Schema(schemaData,globalSchemaOptions);
				if(overwrite[name]!=undefined){
					schema = new overwrite[name](schema);
				}
				models[name] = _mongooseForPath[path].model(name,schema);
			});
			resolve(models);
		})
	},
	mapProperty:function(property, _index = true, _unique = true){
  	
		let result = {};
		let required = [];
		let unique = [];
		let index = [];
		
		if(property.$ref!=undefined){
  		let refName = property.$ref.split("/").pop();
			return {type: Schema.Types.ObjectId, ref: refName};
		}
		
		if(property.properties==undefined){	
			return Schema.Types.Mixed;
		}
		
		
		if(property["required"]!=undefined){
			required = property["required"];
		}
		
		if(property["x-mongoose"]!=undefined && property["x-mongoose"]["schema-options"]!=undefined){
			if(property["x-mongoose"]["schema-options"]["unique"]!=undefined && _unique){
				unique=property["x-mongoose"]["schema-options"]["unique"];
			}
			if(property["x-mongoose"]["schema-options"]["index"]!=undefined && _index){
				index=property["x-mongoose"]["schema-options"]["index"];
			}
		}
		

		_.toPairs(property.properties).forEach(([propertyName,value])=>{
			result[propertyName]=lib.converType(value);
			if(required.indexOf(propertyName)!=-1){
  			result[propertyName].required = true;
			}
			
			if(unique.indexOf(propertyName)!=-1 && _unique){
				result[propertyName].unique = true;
			}
			if(index.indexOf(propertyName)!=-1 && _index){
				result[propertyName].index = true;
			}
		});
		return result;
	},
	converType:function(property){
		var result = {};
		
		if(property.$ref!=undefined){
  		let refName = property.$ref.split("/").pop();
			return {type: Schema.Types.ObjectId, ref: refName};
		}
		
		switch(property.type){
			case "number": 
			case "string": 
			case "boolean": {
				property.type = lib.converFormat(property.type,property.format);
				break;
			}
			case "object": {
				return lib.mapProperty(Object.assign({},property), false, false);
				break;
			}	
			case "array": {
				return [lib.mapProperty(property.items, false, false)];
				break;
			}
		}
		return property;
	},
	converFormat:function(type,format){
		if(format!=undefined&&_format[type][format]!=undefined){
			return _format[type][format];
		}
		return _format[type]._default;
	}
}

module.exports = function({
	path="",
	host="",
	overwrite={},
	options={},
	populate = true
}){
	if(_pathCache.indexOf(path)==-1){
		_pathCache.push(path);
		try{
			_mongooseForPath[path] = mongoose.createConnection(host);
		}catch(e){
			
		}
		
		lib.parserAPI(path, populate).then((api)=>{
			return lib.initSchema({
				path:path,
				api:api,
				overwrite:overwrite
			});
			
		}).then((models)=>{
			console.log("koa-swagger-mongoose: parser swagger model success");
			_modelsForPath[path]=models;
		}).catch((err)=>{
			console.log(err);
			throw "swagger paser error";
		});
	}
	
	
	return (ctx,next)=>{
		ctx.models=_modelsForPath[path];
		return next();
	}
};
