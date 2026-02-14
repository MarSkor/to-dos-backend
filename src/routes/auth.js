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
import { authLimiter } from "../config/arcjet.js";

const router = express.Router();

const rateLimitLogin = async (req, res, next) => {
  const decision = await authLimiter.protect(req);
  if (decision.isDenied())
    return res.status(429).json({ error: "Too many login attempts" });
  next();
};

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
  rateLimitLogin,
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
  rateLimitLogin,
  validate,
  loginUser,
);

router.post("/logout", logOutUser);

router.get("/me", authenticate, getMe);

export default router;
