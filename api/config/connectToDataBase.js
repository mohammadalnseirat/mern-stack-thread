import mongoose from "mongoose";

const connectToDataBase = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("Data base connected", connect.connection.host);
  } catch (error) {
    console.log("Error connecting to data base", error);
    process.exit(1);
  }
};

export default connectToDataBase;
