import {gql} from "apollo-server"


export const typeDefs = gql`


type Ingredient{
  id: ID!
  name: String!
  recipes: [Recipe!]! #ids recetas
}

type Recipe{
  id: ID!
  name: String!
  description: String!
  ingredients: [Ingredient!]! #ids string
  author: User! #id autor
}

type User{
  id: ID!
  email: String!
  pass: String!
  token: String
  recipes: [Recipe!]! #ids recetas
}


type IngredientInput{
  name:String!
}


type Query {
  test: String!
  getRecipe(id:String!):Recipe!
  getRecipes:[Recipe!]!
  getUser(id:String!):User!
  getUsers:[User!]!

  
  
}

type Mutation {
  SignIn: String!
  LogIn:String!
  LogOut: String!
  SingOut:String!
  AddIngredient(name:String!): String!
  AddRecipe(name:String!,description:String!,ingredients:[String!]!): String!
  test(id:String!):String!
  DeleteRecipe(name:String!):String!
  UpdateRecipe(name:String!,newname:String!, description:String!): String!
}

`
