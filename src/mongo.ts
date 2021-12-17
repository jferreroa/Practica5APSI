import { Db, MongoClient } from "mongodb";

export const connectDB = async (): Promise<Db> => {


  
    const user:string = "user"
    const passw:string = "root"
    const dbName = "Jaime"
    const uri:string =  `mongodb+srv://${user}:${passw}@cluster0.cg7qb.mongodb.net/${dbName}?retryWrites=true&w=majority`

    const client = new MongoClient(uri);

  try {
    
    await client.connect();
    console.info("MongoDB connected");
    return client.db(dbName);
    
  }catch (e) {
    throw e;
  }
};