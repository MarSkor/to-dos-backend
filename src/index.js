import express from "express";

const app = express();

const PORT = 3000;

const router = express.Router();

app.get("/", (req, res) => {
  res.send("Hello, welcome to the to-do API");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
