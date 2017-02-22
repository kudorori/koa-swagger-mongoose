# koa@2 swagger-mongoose

---

## Exmaple

### Swagger Example
```
	TODO
```

### Koa Example

```
import models from 'swagger-mongoose'

app.use(models({
	path:[string], //swagger doc 路徑
	host:[string], //mongo connect host
	overwrite:[object] //重寫類別物件
}));


app.use(async(ctx,next)=>{
	let user = new ctx.models.user();
	//...
});
```

### Overwrite Object Example
```
{
	user:[class],
	pet:[class]
}
```

### Overwrite Class Example
```
export default class {
	constructor(schema){
		schema.methods.addUser = this.addUser;
		//OR
		schema.methods.deleteUser = (id)=>{
			
		};
		return schema;
	}
	//custom method....
	addUser(){
		console.log("ADDUSER");
	}
}
```
