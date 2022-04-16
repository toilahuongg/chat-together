import dotenv from 'dotenv';
import mongoose from 'mongoose';
const  config = async () => { 
    dotenv.config({path:__dirname+'/./../../.env'})
    const { PORT, MONGO_CONNECTSTRING, MONGO_USER, MONGO_PASSWORD } = process.env;
    await mongoose.connect(MONGO_CONNECTSTRING || '', {
    user: MONGO_USER,
    pass: MONGO_PASSWORD,
    })
    console.log("Mongodb Connected");
}
export default config