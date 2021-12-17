import { ApolloServer } from "apollo-server"
import { connectDB } from "./mongo"
import { Ingredient, Mutation, Recipe, User } from "./resolvers/Mutation"
import { Query } from "./resolvers/Query"
import { typeDefs } from "./schema"







const resolvers = {
    Query,
    Mutation,
    Recipe,
    User,
    Ingredient
}

const run = async () => {

    try {

        const clientDB = await connectDB()
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            context: async ({ req, res }) => {

                
                const pass = req.headers["pass"]
                const email = req.headers["email"]
                const token = req.headers["token"]

                const logged = ["LogOut", "SingOut", "AddIngredient","AddRecipe","test","DeleteRecipe","UpdateRecipe"]
                const notlogged = ["SignIn","LogIn"]
                const getters = ["getRecipe"]
               
                const query = req.body.query.toString()
                console.log(query)

                

                if(logged.some(key => query.includes(key)) && token && pass && email) { //si requiere estar logueado y ha introducido el token
                        return {
                            clientDB,
                            pass,
                            email,
                            token
                        }
                    
    
                }
                if(pass && email) {
                    return {
                        clientDB,
                        pass,
                        email,
                    }
                }
                    console.log("No hay headers")
                    return {clientDB}
                
            }
        })

        server.listen(80).then(() => {
            console.log("Server listening on port 1111")
        })
    } catch (error) {
        console.error(error)
    }


}


try {
    run()
} catch (error) {
    console.log(error)
}
