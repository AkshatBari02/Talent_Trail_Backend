import mongoose from "mongoose";

export const dbConnection = ()=>{
    mongoose.connect(process.env.MONGO_URL,{dbName:"Talent_Trail_DB"}).then(()=>{
        console.log("Successfully Connected To Database");
    }).catch((err)=>{
        console.log(`Some error occured during connection to database: ${err}`);
    })
}