import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import todosRouter from "./routes/todos.js";
import authRouter from "./routes/auth.js";
import securityMiddleware from "./middleware/security.js";

const app = express();

const PORT = 3000;

if (!process.env.FRONTEND_URL) {
  console.warn("Warning: FRONTEND_URL not set.");
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(securityMiddleware);

app.use("/api/auth", authRouter);
app.use("/api/todos", todosRouter);

app.get("/", (req, res) => {
  res.send("TODO API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
