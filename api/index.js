import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDataBase from "./config/connectToDataBase.js";
dotenv.config();
const PORT = process.env.PORT || 3000
const app = express();
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.listen(PORT, () => {
    connectToDataBase()
  console.log(`server running on port ${PORT}`);
});
