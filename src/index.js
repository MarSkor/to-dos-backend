import express from "express";
import todosRouter from "./routes/todos.js";
import cors from "cors";

const app = express();

const PORT = 3000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use("/api/todos", todosRouter);

app.get("/", (req, res) => {
  res.send("Hello, welcome to the to-do API");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
