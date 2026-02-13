import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/app.js";
import { compare, hash } from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ error: "Invalid credentials. Please try again." });
    }

    const passwordHash = await hash(password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: passwordHash,
      })
      .returning({ id: users.id, email: users.email });

    res.status(201).json({ message: "User registered", user: newUser });
  } catch (error) {
    console.log("register error: ", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isPasswordMatching = await compare(password, user.password);
    if (!isPasswordMatching) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 3600000,
    });

    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.log("login error: ", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const logOutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
  res.json({ message: "User is logged out." });
};

export const getMe = async (req, res) => {
  try {
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, req.user.id));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
