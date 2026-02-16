import express from "express";
import authenticate from "../middleware/auth.js";
import {
  getTodos,
  createTodo,
  deleteTodo,
  editTodo,
  deleteCompletedTodos,
} from "../controllers/todosController.js";
import { body, param } from "express-validator";
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
  param("id")
    .isInt({ min: 1 })
    .withMessage("Todo id must be a positive integer.")
    .toInt(),
  body().custom((_, { req }) => {
    if (req.body.content === undefined && req.body.isComplete === undefined) {
      throw new Error("At least one of content or isComplete is required.");
    }
    return true;
  }),
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

const deleteTodoValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Todo id must be a positive integer.")
    .toInt(),
];

const router = express.Router();

router.get("/", authenticate, getTodos);
router.post("/", authenticate, createTodoValidation, validate, createTodo);
router.patch("/:id", authenticate, updateTodoValidation, validate, editTodo);
router.delete("/completed", authenticate, deleteCompletedTodos);
router.delete("/:id", authenticate, deleteTodoValidation, validate, deleteTodo);

export default router;
