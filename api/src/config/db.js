import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || "ims",
    });
    // console.log(
    //   `MongoDB Connected: ${conn.connection.host}: ${process.env.MONGO_URI}`
    // );
    console.log(`MongoDB Connected !`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
