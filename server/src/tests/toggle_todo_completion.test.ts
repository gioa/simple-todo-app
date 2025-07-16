
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type ToggleTodoCompletionInput } from '../schema';
import { toggleTodoCompletion } from '../handlers/toggle_todo_completion';
import { eq } from 'drizzle-orm';

describe('toggleTodoCompletion', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should toggle todo completion status to true', async () => {
    // Create a test todo
    const createResult = await db.insert(todosTable)
      .values({
        text: 'Test todo',
        completed: false
      })
      .returning()
      .execute();

    const todo = createResult[0];
    const originalUpdatedAt = todo.updated_at;

    // Wait a bit to ensure updated_at changes
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: ToggleTodoCompletionInput = {
      id: todo.id,
      completed: true
    };

    const result = await toggleTodoCompletion(input);

    // Verify the result
    expect(result.id).toEqual(todo.id);
    expect(result.text).toEqual('Test todo');
    expect(result.completed).toEqual(true);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should toggle todo completion status to false', async () => {
    // Create a completed test todo
    const createResult = await db.insert(todosTable)
      .values({
        text: 'Completed todo',
        completed: true
      })
      .returning()
      .execute();

    const todo = createResult[0];

    const input: ToggleTodoCompletionInput = {
      id: todo.id,
      completed: false
    };

    const result = await toggleTodoCompletion(input);

    // Verify the result
    expect(result.id).toEqual(todo.id);
    expect(result.text).toEqual('Completed todo');
    expect(result.completed).toEqual(false);
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated todo to database', async () => {
    // Create a test todo
    const createResult = await db.insert(todosTable)
      .values({
        text: 'Test todo for database check',
        completed: false
      })
      .returning()
      .execute();

    const todo = createResult[0];

    const input: ToggleTodoCompletionInput = {
      id: todo.id,
      completed: true
    };

    await toggleTodoCompletion(input);

    // Verify the todo was updated in the database
    const updatedTodos = await db.select()
      .from(todosTable)
      .where(eq(todosTable.id, todo.id))
      .execute();

    expect(updatedTodos).toHaveLength(1);
    expect(updatedTodos[0].completed).toEqual(true);
    expect(updatedTodos[0].text).toEqual('Test todo for database check');
  });

  it('should throw error when todo does not exist', async () => {
    const input: ToggleTodoCompletionInput = {
      id: 999,
      completed: true
    };

    await expect(toggleTodoCompletion(input)).rejects.toThrow(/Todo with id 999 not found/i);
  });
});
