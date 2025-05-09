import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/auth.route.js"

dotenv.config();

const app = express();

// 1. Cookie parser first
app.use(cookieParser());

// 2. Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT;

app.get("/" , (req , res)=>{
    res.send("Hello Guys welcome to leetShaastra🔥");
})

app.use("/api/v1/auth" , authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
