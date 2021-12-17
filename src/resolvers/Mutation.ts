import { Db } from "mongodb";
import { v4 as uuid } from "uuid";

export const Mutation = {

	SignIn:async (parent:any, args:any, {clientDB, pass,email}:{clientDB:Db, pass:string, email:string}) => { 
		
		const find = await clientDB.collection("practica5usuarios").findOne({email:email})
		if(find) {
			return "Email ya registrado"
		}else{
			await clientDB.collection("practica5usuarios").insertOne({
				id: (Math.random() + 1).toString(36).substring(7),
				pass: pass,
				email: email,
				token: null,
				recipes: []
			})
			return "usuario registrado" 
		}
	},



	LogIn: async (parent:any, args:any, {clientDB, pass,email}:{clientDB:Db, pass:string, email:string}) => {
		//retornar token
		const find = await clientDB.collection("practica5usuarios").findOne({email: email, pass: pass, token: null});
		const token = uuid()
		if(find) {
			console.log(find)
			await clientDB.collection("practica5usuarios").updateOne({ email: email }, { $set: { token: token } })
			console.log("loged + " + token + "\n")
			return "logueado + " + token
		}else{
			return "no logueado"
		}
	},


	LogOut: async (parent: any, args: any,{clientDB,pass, email,token}:{clientDB:Db,pass:string,email:string,token:string}) => {
		console.log("token" + token)
	   const findedLog = await clientDB.collection("practica5usuarios").findOne({email: email, pass:pass, token: token})
		console.log(findedLog)
		if(findedLog){
			await clientDB.collection("practica5usuarios").updateOne({email: email, pass:pass, token: token}, { $set: {token: null}});
			return "Usuario deslogueado.";
		}else{
			return "Usuario no deslogueado"
		}
	   
	 },



	 SingOut: async (parent:any, args:any,{clientDB,pass, email, token}:{clientDB:Db,pass:string,email:string, token:string} ) =>  {
		console.log(token)
		return token.toString();
	},



	AddIngredient:async (parent:any,{name}:{name:string},{email,pass,token,clientDB}:{clientDB:Db,email:string,pass:string,token:string}) => {
		const findedLog = await clientDB.collection("practica5usuarios").findOne({email: email, pass:pass, token: token})
		if(findedLog){	
			await clientDB.collection("ingredientes").insertOne({
				id: token, //ingrediente asignado a un usuario
				name:name,
				recipes: []
			})
			return "Ingrediente añadido"
		}else{
			return "Ingrediente no añadido"
		}
		
    },


	AddRecipe:async (parent:any,{name,description,ingredients}: {name:string,description:string,ingredients:string[]}, {email,pass,token,clientDB}:{clientDB:Db,email:string,pass:string,token:string}) => {
		const findedLog = await clientDB.collection("practica5usuarios").findOne({email: email, pass:pass, token: token})
		if(findedLog){
			const arrIngredientes:string[] = ingredients
			console.log(arrIngredientes)
			arrIngredientes.forEach(async (ingrediente:string) => {
				const ingredienteEncontrado = await clientDB.collection("ingredientes").findOne({name:ingrediente})
				if(!ingredienteEncontrado){ //si hay algun ingrediente "desconocido" la receta no es valida
					return "Uno de los ingredientes no se encuentra en la base de datos"
				}
			})
			//si estan todos los ingredientes en la base de datos añadimos el nombre de la receta a el ingrediente en la BD 
			
			const recetaRepetida = await clientDB.collection("recetas").findOne({name: name}) //receta con el mismo nombre 
			if(recetaRepetida){
				return "receta repetida"
			}
			
			const usuario = await clientDB.collection("practica5usuarios").findOne({
				pass:pass, 
				email:email,
				token:token
			})

			let ArrIdsIngredientes:string[] = []
			arrIngredientes.forEach(async(ingrediente:string) => {
				const ingre  = await clientDB.collection("ingredientes").findOne({
					name: ingrediente
				})

				ArrIdsIngredientes.push(ingre.name)
			})
			
			const idUsuario = usuario.id
			const idReceta = (Math.random() + 1).toString(36).substring(7)

			console.log("inicio")

			//agregamos las recetas a la BD de recetas 
			await clientDB.collection("recetas").insertOne({
				id: idReceta,
				name:name,
				description:description,
				ingredients:[],
				author: idUsuario

			})

			await clientDB.collection("recetas").updateOne(
				{id:idReceta},
				{$push:{
					ingredients: ArrIdsIngredientes
				}}
			)
			console.log("recetas a BD")
			//agregamos las recetas al usuario
			await clientDB.collection("practica5usuarios").updateOne(
				{email:email, pass:pass,token:token},
				{$push:{
					recipes:idReceta //agregamos su id
					
				}}
			)
			console.log("recetas a usuario")
			//agregamos las recetas a los ingredientes 
			arrIngredientes.forEach(async (ingrediente:string) => {
				await clientDB.collection("ingredientes").updateOne(
					{name:ingrediente},
					{$push: {
						recipes:idReceta
				}})
			})

			console.log("recetas a ingredientes")


			return "receta añadida"

		}else{
			return "receta no añadida, no estas logueado"
		}
	},

	test: async (parent:any,{id}:{id}, {email,pass,token,clientDB}:{clientDB:Db,email:string,pass:string,token:string}) => {
		const receta = await clientDB.collection("recetas").findOne({id:id})
		
		const x = receta.ingredients[0]
			
		
		return x.toString()
	},


	DeleteRecipe:async (parent:any,{name}:{name:string}, {email,pass,token,clientDB}:{clientDB:Db,email:string,pass:string,token:string}) => {
		
		const findedLog = await clientDB.collection("practica5usuarios").findOne({email: email, pass:pass, token: token})

		if(findedLog){
			const authorID = findedLog.id
			console.log(authorID)
			const receta = await clientDB.collection("recetas").findOne({
				name: name,
				author: authorID //es suya la receta
			})


			if(receta){
				const idReceta = receta.id
				//const author = receta.author
				const arrIngredientesReceta = receta.ingredients[0]
				//eliminar de ingredientes receta
				arrIngredientesReceta.forEach(async (ingrediente:string) => {
					const updated = await clientDB.collection("ingredientes").updateOne(
						{name:ingrediente},
						{$pull:{recipes:idReceta}}
					) 

					if(!updated){
						return "error al actualizar los ingredientes"
					}
				})	

				//eliminar de recetas la receta
				await clientDB.collection("recetas").deleteOne({
					id:idReceta,
					author:authorID
				})

				//eliminar de usuarios
				await clientDB.collection("practica5usuarios").updateOne(
					{
						id:authorID,
						pass:pass, 
						email:email,
						token:token
					},
					{$pull:{recipes:idReceta}}
				)
				
				return "receta eliminada"
			}else{
				return "no existe receta con ese nombre"
			}
		}else{
			return "receta no eliminada, no estas logueado"
		}
		
	},

	
	



	
	UpdateRecipe:async(parent:any, {name,newname, description}:{name:string, newname:string,description:string,ingredients:string[]},{email,pass,token,clientDB}:{clientDB:Db,email:string,pass:string,token:string}) => {
			//check si la receta es mia
		const findedLog = await clientDB.collection("practica5usuarios").findOne({email: email, pass:pass, token: token})
		if(findedLog){
			const authorID = findedLog.id
			console.log(authorID)
			const receta = await clientDB.collection("recetas").findOne({
				name: name,
				author: authorID //es suya la receta
			})

			if(receta){

				const updated = await clientDB.collection("recetas").updateOne(
					{name:name},
					{$set:{
						name:newname,
						description:description,
						
					}}
				)

				if(updated){
					return "se ha actualizado la receta"
				}else{
					return "no se ha actualizado la receta"
				}


			}else{
				return "no tienes recetas"
			}


		}else{
			"no estas logueado"
		}
		
		
	}






}



export const Recipe = {
	ingredients: async(parent: {ingredients:any}, args: any, {clientDB}:{clientDB:Db}) => {
		//console.log("Hola")
		console.log("recipe.ingredients")
		//console.log("patat")
		console.log(parent.ingredients[0])
		let arrayObjIngrediente = []
		if(parent.ingredients.length == 1){
			 arrayObjIngrediente = parent.ingredients[0].map(async(ingrediente:string) => {
				console.log("holaaaa" + ingrediente + "holaaaaaaa\n")
				const ObjIngrediente = await clientDB.collection("ingredientes").findOne({name:ingrediente})
				//console.log(ObjIngrediente.name)
				return {
					id:ObjIngrediente.id,
					name:ObjIngrediente.name,
					recipes:ObjIngrediente.recipes
				}
			})
		}else{
			 arrayObjIngrediente = parent.ingredients.map(async(ingrediente:string) => {
				console.log("holaaaa" + ingrediente + "holaaaaaaa\n")
				const ObjIngrediente = await clientDB.collection("ingredientes").findOne({name:ingrediente})
				//console.log(ObjIngrediente.name)
				return {
					id:ObjIngrediente.id,
					name:ObjIngrediente.name,
					recipes:ObjIngrediente.recipes
				}
			})
		}

		
		//console.log(arrayObjIngrediente)
		return arrayObjIngrediente
	},
	author: async(parent: {author:string}, args: any, {clientDB}:{clientDB:Db}) => {
		console.log("HOOLA123" + parent.author)
		const user = await clientDB.collection("practica5usuarios").findOne({id:parent.author})

		return {
			id:user.id,
			email:user.email, 
			pass:user.pass, 
			token:user.token,
			recipes:user.recipes
		}
	}
}


export const User = {
	recipes:async (parent: {recipes:string[]}, args: any, {clientDB}:{clientDB:Db}) => {
		console.log("user.recipes")
		const arrayRecetas:any = parent.recipes.map(async (receta:string)=> {
			console.log(1 + receta)
			const ObjReceta = await clientDB.collection("recetas").findOne({id:receta})
			//if(ObjReceta){
				console.log(ObjReceta)
				return {
					id:ObjReceta.id,
					name:ObjReceta.name,
					description:ObjReceta.description,
					ingredients:ObjReceta.ingredients,
					author:ObjReceta.author,
				}
			//}
			
		})
		console.log(arrayRecetas)
		return arrayRecetas
	}
}

export const Ingredient = {
	recipes: async (parent :{recipes:string[]}, args:any, {clientDB} :{clientDB:Db}) => {
		console.log("ingredient.recipes")
		const arrayRecetas:any = parent.recipes.map(async (receta:string)=> {
			console.log(1 + receta)
			const ObjReceta = await clientDB.collection("recetas").findOne({id:receta})
			//if(ObjReceta){
				console.log(ObjReceta)
				return {
					id:ObjReceta.id,
					name:ObjReceta.name,
					description:ObjReceta.description,
					ingredients:ObjReceta.ingredients,
					author:ObjReceta.author,
				}
			//}
			
		})
		console.log(arrayRecetas)
		return arrayRecetas
	}
}