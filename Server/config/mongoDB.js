import mongoose from "mongoose";

//MongoDB Connection
const connectDB = async () => {
    mongoose.connect( process.env.MONGODB_URL, {
        dbName: "Vybe_Social-Media-Website"
    }).then(() => {
        console.log("MongoDB Connected..!");
    }).catch((err) => {
        console.log(err);
    });
};


export default connectDB;