import { validationResult } from "express-validator";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((error) => ({
        path: error.path,
        msg: error.msg,
      })),
    });
  }
  next();
};

export default validate;
