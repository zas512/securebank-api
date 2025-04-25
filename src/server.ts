import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import routes from "./routes/index";

dotenv.config();
const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || (process.env.ALLOWED_ORIGINS ?? "").includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());

// Routes
app.get("/test", (req, res) => {
  res.status(200).json({ message: "Server working" });
});
app.use("/", routes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

// Server
connectDB();
app.listen(3000, () => {
  try {
    console.log("Server running on port 3000");
  } catch (error) {
    console.log("Error starting server:", error);
  }
});
