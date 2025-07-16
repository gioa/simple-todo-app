
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { todosTable } from '../db/schema';
import { getTodos } from '../handlers/get_todos';

describe('getTodos', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no todos exist', async () => {
    const result = await getTodos();

    expect(result).toEqual([]);
  });

  it('should return all todos ordered by creation date (newest first)', async () => {
    // Create test todos with slight delay to ensure different timestamps
    const todo1 = await db.insert(todosTable)
      .values({
        text: 'First todo',
        completed: false
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const todo2 = await db.insert(todosTable)
      .values({
        text: 'Second todo',
        completed: true
      })
      .returning()
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(2);
    
    // Verify newest first ordering
    expect(result[0].text).toEqual('Second todo');
    expect(result[0].completed).toBe(true);
    expect(result[1].text).toEqual('First todo');
    expect(result[1].completed).toBe(false);
    
    // Verify timestamps are properly ordered (newest first)
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return todos with all required fields', async () => {
    await db.insert(todosTable)
      .values({
        text: 'Test todo',
        completed: false
      })
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(1);
    
    const todo = result[0];
    expect(todo.id).toBeDefined();
    expect(typeof todo.id).toBe('number');
    expect(todo.text).toEqual('Test todo');
    expect(todo.completed).toBe(false);
    expect(todo.created_at).toBeInstanceOf(Date);
    expect(todo.updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple todos with mixed completion status', async () => {
    // Create multiple todos with different completion states
    await db.insert(todosTable)
      .values([
        { text: 'Completed todo', completed: true },
        { text: 'Incomplete todo', completed: false },
        { text: 'Another completed todo', completed: true }
      ])
      .execute();

    const result = await getTodos();

    expect(result).toHaveLength(3);
    
    // Verify all todos are returned regardless of completion status
    const completedTodos = result.filter(todo => todo.completed);
    const incompleteTodos = result.filter(todo => !todo.completed);
    
    expect(completedTodos).toHaveLength(2);
    expect(incompleteTodos).toHaveLength(1);
  });
});
