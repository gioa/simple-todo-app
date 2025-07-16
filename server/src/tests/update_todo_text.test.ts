
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type UpdateTodoTextInput } from '../schema';
import { updateTodoText } from '../handlers/update_todo_text';
import { eq } from 'drizzle-orm';

describe('updateTodoText', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update todo text', async () => {
    // Create a todo first
    const created = await db.insert(todosTable)
      .values({
        text: 'Original todo text',
        completed: false
      })
      .returning()
      .execute();

    const todoId = created[0].id;
    const originalUpdatedAt = created[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateTodoTextInput = {
      id: todoId,
      text: 'Updated todo text'
    };

    const result = await updateTodoText(input);

    // Verify the updated todo
    expect(result.id).toEqual(todoId);
    expect(result.text).toEqual('Updated todo text');
    expect(result.completed).toEqual(false); // Should remain unchanged
    expect(result.created_at).toEqual(created[0].created_at); // Should remain unchanged
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should save updated todo to database', async () => {
    // Create a todo first
    const created = await db.insert(todosTable)
      .values({
        text: 'Original todo text',
        completed: true
      })
      .returning()
      .execute();

    const todoId = created[0].id;

    const input: UpdateTodoTextInput = {
      id: todoId,
      text: 'Database updated text'
    };

    await updateTodoText(input);

    // Verify the todo was updated in the database
    const todos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todoId))
      .execute();

    expect(todos).toHaveLength(1);
    expect(todos[0].text).toEqual('Database updated text');
    expect(todos[0].completed).toEqual(true); // Should remain unchanged
    expect(todos[0].updated_at).toBeInstanceOf(Date);
    expect(todos[0].updated_at.getTime()).toBeGreaterThan(created[0].updated_at.getTime());
  });

  it('should throw error when todo not found', async () => {
    const input: UpdateTodoTextInput = {
      id: 999, // Non-existent ID
      text: 'Updated text'
    };

    await expect(updateTodoText(input)).rejects.toThrow(/Todo with id 999 not found/i);
  });

  it('should preserve other todo properties', async () => {
    // Create a completed todo
    const created = await db.insert(todosTable)
      .values({
        text: 'Original text',
        completed: true
      })
      .returning()
      .execute();

    const todoId = created[0].id;

    const input: UpdateTodoTextInput = {
      id: todoId,
      text: 'New text content'
    };

    const result = await updateTodoText(input);

    // Verify all properties
    expect(result.id).toEqual(todoId);
    expect(result.text).toEqual('New text content');
    expect(result.completed).toEqual(true); // Should remain true
    expect(result.created_at).toEqual(created[0].created_at); // Should not change
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(created[0].updated_at.getTime());
  });
});
