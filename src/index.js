import "dotenv/config";
import connectDB from "./db/db_connection.js";
import { app } from "./app.js";



connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`Server is running at ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log("Error is connceting to database", error);
    });
