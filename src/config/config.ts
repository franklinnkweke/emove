import mongoose from "mongoose";
import { DB_URI } from "../env";

const databaseConnection = () => {
  mongoose
    .connect(`${DB_URI}`)
    .then(() => {
      console.log(`Database connection established`);
    })
    .catch((err) => {
      setTimeout(databaseConnection, 30000);
      console.log("Could not connect to database: ", err);
    });

  mongoose.connection.on("connection", (connection: mongoose.Connection) => {
    console.log("Mongoose default connection open to" + connection.host);
  });
};

export default databaseConnection;
