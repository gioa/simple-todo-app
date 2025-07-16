
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type DeleteTodoInput } from '../schema';
import { deleteTodo } from '../handlers/delete_todo';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: DeleteTodoInput = {
  id: 1
};

describe('deleteTodo', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete a todo', async () => {
    // Create a todo first
    await db.insert(todosTable)
      .values({
        text: 'Test Todo',
        completed: false
      })
      .execute();

    const result = await deleteTodo(testInput);

    // Should return success indicator
    expect(result.success).toBe(true);
  });

  it('should remove todo from database', async () => {
    // Create a todo first
    const insertResult = await db.insert(todosTable)
      .values({
        text: 'Test Todo',
        completed: false
      })
      .returning()
      .execute();

    const todoId = insertResult[0].id;

    // Delete the todo
    await deleteTodo({ id: todoId });

    // Verify todo is removed from database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todoId))
      .execute();

    expect(todos).toHaveLength(0);
  });

  it('should handle non-existent todo gracefully', async () => {
    // Try to delete a non-existent todo
    const result = await deleteTodo({ id: 999 });

    // Should still return success (idempotent operation)
    expect(result.success).toBe(true);
  });

  it('should not affect other todos', async () => {
    // Create multiple todos
    const insertResult = await db.insert(todosTable)
      .values([
        { text: 'First Todo', completed: false },
        { text: 'Second Todo', completed: true },
        { text: 'Third Todo', completed: false }
      ])
      .returning()
      .execute();

    const todoToDelete = insertResult[1]; // Delete the second todo

    // Delete one todo
    await deleteTodo({ id: todoToDelete.id });

    // Verify only one todo was deleted
    const remainingTodos = await db.select()
      .from(todosTable)
      .execute();

    expect(remainingTodos).toHaveLength(2);
    expect(remainingTodos.map(t => t.text)).toEqual(['First Todo', 'Third Todo']);
  });
});
