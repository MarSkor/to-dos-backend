import express from "express";
import { body } from "express-validator";
import authenticate from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  getMe,
  loginUser,
  logOutUser,
  registerUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Invalid email format.")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long.")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
  ],
  validate,
  registerUser,
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Invalid email format.")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  loginUser,
);

router.post("/logout", logOutUser);

router.get("/me", authenticate, getMe);

export default router;
