import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            process.env.MONGO_DB_URL
        );

        console.log(
            `MongoDB Connected!! ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log("Error in connecting to Database: ", error);
        process.exit(1);
    }
};

export default connectDB;
