import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./src/routes/auth.route.js";
import problemRoutes from "./src/routes/problem.route.js";
import executionRoute from "./src/routes/executeCode.route.js";
import submissionRoute from "./src/routes/submission.route.js";

dotenv.config();

const app = express();

// 1. Cookie parser first
app.use(cookieParser());

// 2. Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello Guys welcome to leetShaastra🔥");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoute);
app.use("/api/v1/submission", submissionRoute);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
