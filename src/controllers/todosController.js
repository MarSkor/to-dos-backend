import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { todos } from "../db/schema/app.js";

const getTodos = async (req, res) => {
  try {
    const { filter, page = 1, limit = 10 } = req.query;

    if (process.env.NODE_ENV === "production") {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [eq(todos.userId, userId)];

    if (req.user?.id) {
      whereConditions.push(eq(todos.userId, req.user.id));
    }

    if (filter === "completed") {
      whereConditions.push(eq(todos.isCompleted, true));
    } else if (filter === "active") {
      whereConditions.push(eq(todos.isCompleted, false));
    }

    const results = await db
      .select()
      .from(todos)
      .where(and(...whereConditions))
      .limit(limitNum)
      .offset(offset)
      .orderBy(desc(todos.createdAt));

    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(todos)
      .where(and(...whereConditions));

    res.json({
      data: results,
      pagination: {
        totalItems: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error(`GET /todos error: ${error}`);
    res.status(500).json({ error: "Failed to get todos" });
  }
};

export default getTodos;
