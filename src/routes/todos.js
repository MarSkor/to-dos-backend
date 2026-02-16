import express from "express";
import authenticate from "../middleware/auth.js";
import {
  getTodos,
  createTodo,
  deleteTodo,
  editTodo,
  deleteCompletedTodos,
} from "../controllers/todosController.js";
import { body } from "express-validator";
import validate from "../middleware/validate.js";

const createTodoValidation = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Todo content is required.")
    .isLength({ max: 240 })
    .withMessage("Content is too long. (Max 240)"),
];

const updateTodoValidation = [
  body("content")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty.")
    .isLength({ max: 240 })
    .withMessage("Content is too long. (Max 240)"),
  body("isComplete")
    .optional()
    .isBoolean()
    .withMessage("isComplete must be a boolean."),
];

const router = express.Router();

router.get("/", authenticate, getTodos);
router.post("/", authenticate, createTodoValidation, validate, createTodo);
router.patch("/:id", authenticate, updateTodoValidation, validate, editTodo);
router.delete("/completed", authenticate, deleteCompletedTodos);
router.delete("/:id", authenticate, deleteTodo);

export default router;
