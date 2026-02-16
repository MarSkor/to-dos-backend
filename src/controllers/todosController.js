import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { todos } from "../db/schema/app.js";

export const getTodos = async (req, res) => {
  try {
    const { filter, page = 1, limit = 10 } = req.query;

    const userId = req.user.id;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(parseInt(limit, 10) || 10, 100));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [eq(todos.userId, userId)];

    if (filter === "completed") {
      whereConditions.push(eq(todos.isComplete, true));
    } else if (filter === "active") {
      whereConditions.push(eq(todos.isComplete, false));
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

    res.status(200).json({
      data: results,
      pagination: {
        totalItems: Number(count),
        totalPages: Math.ceil(Number(count) / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    // console.error(`GET /todos error: ${error}`);
    res.status(500).json({ error: "Failed to get tasks" });
  }
};

export const createTodo = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    const [newTodo] = await db
      .insert(todos)
      .values({
        userId,
        content,
        isComplete: false,
      })
      .returning();

    res.status(201).json(newTodo);
  } catch (error) {
    // console.error(`POST /todos error: ${error}`);
    res.status(500).json({ error: "Failed to create new task." });
  }
};

export const editTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, isComplete } = req.body;
    const userId = req.user.id;

    const [updatedTodo] = await db
      .update(todos)
      .set({
        ...(content !== undefined && { content }),
        ...(isComplete !== undefined && { isComplete }),
      })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();

    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(updatedTodo);
  } catch (error) {
    // console.error(`PATCH /todos error: ${error}`);
    res.status(500).json({ error: "Failed to update task." });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [deleted] = await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning({ id: todos.id });

    if (!deleted) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.status(204).send();
  } catch (error) {
    // console.error(`DELETE /todos error: ${error}`);
    res.status(500).json({ error: "Failed to delete task." });
  }
};

export const deleteCompletedTodos = async (req, res) => {
  try {
    const userId = req.user.id;

    await db
      .delete(todos)
      .where(and(eq(todos.isComplete, true), eq(todos.userId, userId)));

    res.status(200).json({ message: "Cleared completed items" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear completed" });
  }
};
