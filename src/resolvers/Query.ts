

import { Db } from "mongodb";
export const Query = {

    test: (parent: any, args: any, context: any): String => {
        return "test"
    },


    getRecipe: async (parent: any, { id }: { id: string }, { clientDB }: { clientDB: Db }) => {
        const receta = await clientDB.collection("recetas").findOne({ id: id })
        console.log(receta.id)
        if (receta) {
            return {
                id: receta.id,
                name: receta.name,
                description: receta.description,
                ingredients: receta.ingredients[0],
                author: receta.author
            }
        } else {
            return "no existe receta con ese id"
        }
    },


    getRecipes: async (parent: any, args: any, { clientDB }: { clientDB: Db }) => {
        const recetas = await clientDB.collection("recetas").find().toArray()
        console.log(recetas)
        const userarr = recetas.map(async elem => {
            return {
                id: elem.id,
                name: elem.name,
                description: elem.description,
                ingredients: elem.ingredients,
                author: elem.author
            }
        })
        return userarr

    },




    getUser: async (parent: any, { id }: { id: string }, { clientDB }: { clientDB: Db }) => {
        console.log("getuser")
        const user = await clientDB.collection("practica5usuarios").findOne({ id: id })
        if (user) {
            console.log(user)
            return {
                id: user.id,
                email: user.email,
                pass: user.pass,
                token: user.token,
                recipes: user.recipes,
            }
        } else {
            return "no se ha econtrado al usuario"
        }
    },


    getUsers: async (parent: any, args: any, { clientDB }: { clientDB: Db }) => {
        console.log("getusers")
        const users = await clientDB.collection("practica5usuarios").find().toArray()
        console.log(users)
        const userarr = users.map(async elem => {
            return {
                id: elem.id,
                pass: elem.pass,
                email: elem.email,
                token: elem.token,
                recipes: elem.recipes
            }
        })
        return userarr

    }



}