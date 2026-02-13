import express from "express";
import authenticate from "../middleware/auth.js";
import getTodos from "../controllers/todosController.js";

const router = express.Router();

router.get("/", authenticate, getTodos);

export default router;
