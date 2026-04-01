import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

// connectioninstance holds response
// console connnectioninstance
// connectionInstance.connection.host jha pr connection ho rha hai
export const connectDB=async ()=>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MOngoDB connected !! DB HOST: ${connectionInstance.connection.host}`)
    }catch(error){
        console.log("MONGODB Connection ERROR:",error)
        process.exit(1)
    }
}


