import connectDB from "./db/db_connection.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config();

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running at ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log("Error is connceting to database", error);
    });
