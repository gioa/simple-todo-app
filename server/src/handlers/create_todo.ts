
import { db } from '../db';
import { todosTable } from '../db/schema';
import { type CreateTodoInput, type Todo } from '../schema';

export const createTodo = async (input: CreateTodoInput): Promise<Todo> => {
  try {
    // Insert todo record
    const result = await db.insert(todosTable)
      .values({
        text: input.text,
        completed: false, // Default value
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Todo creation failed:', error);
    throw error;
  }
};
