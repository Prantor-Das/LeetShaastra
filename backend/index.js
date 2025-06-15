import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import redisClient from "./src/libs/redisClient.js";
import { db } from "./src/libs/db.js";

import authRoutes from "./src/routes/auth.route.js";
import problemRoutes from "./src/routes/problem.route.js";
import executionRoute from "./src/routes/executeCode.route.js";
import submissionRoute from "./src/routes/submission.route.js";
import playlistRoutes from "./src/routes/playlist.route.js";
import healthcheckRoute from "./src/routes/healthcheck.route.js";

dotenv.config();

const app = express();

// 1. Cookie parser first
app.use(cookieParser());

// 2. Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello Guys welcome to leetShaastra🔥");
});

app.use('/', healthcheckRoute);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executionRoute);
app.use("/api/v1/submission", submissionRoute);
app.use("/api/v1/playlist", playlistRoutes);

// Listen for Redis errors early
redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});

async function initializeConnection() {
  try {
    // Connect DB and Redis in parallel
    await Promise.all([
      db.$connect(),
      redisClient.isOpen ? Promise.resolve() : redisClient.connect()
    ]);

    console.log("DB and Redis connected successfully");

    app.listen(port, () => {
      console.log(`Server listening at port number: ${port}`);
    });
  } catch (err) {
    console.error("Error during initialization:", err);
    process.exit(1); // Exit process with failure
  }
}

initializeConnection();