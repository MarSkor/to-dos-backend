import aj from "../config/arcjet.js";

const securityMiddleware = async (req, res, next) => {
  if (process.env.NODE_ENV === "test") return next();

  try {
    const decision = await aj.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Automated requests are not allowed.",
      });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Request blocked by security policy.",
      });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Rate limit exceeded. Please slow down.",
      });
    }

    req.arcjet = decision;

    next();
  } catch (error) {
    console.error("Arcjet middleware error: ", error);
    res.status(500).json({
      error: "Internal error",
      message: "Something went wrong with security middleware.",
    });
  }
};

export default securityMiddleware;
