import mongoose from "mongoose";

const connectMongpDB = async (req, res) => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`MongoDB Connected ${conn.connection.host}`);
    }
    catch (error) {
        console.error(`Error connecting to mongodb: ${error.message}`);
        process.exit(1);
    }
}



export default connectMongpDB; 