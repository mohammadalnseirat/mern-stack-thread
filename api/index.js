import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectToDataBase from "./config/connectToDataBase.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json({limit:'50mb'}));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
// ! Routes here:
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.listen(PORT, () => {
  connectToDataBase();
  console.log(`server running on port ${PORT}`);
});

// *MiddleWare To handle Errors:
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
  });
});
