
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import { 
  createTodoInputSchema,
  updateTodoTextInputSchema,
  toggleTodoCompletionInputSchema,
  deleteTodoInputSchema
} from './schema';

// Import handlers
import { createTodo } from './handlers/create_todo';
import { getTodos } from './handlers/get_todos';
import { updateTodoText } from './handlers/update_todo_text';
import { toggleTodoCompletion } from './handlers/toggle_todo_completion';
import { deleteTodo } from './handlers/delete_todo';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new todo item
  createTodo: publicProcedure
    .input(createTodoInputSchema)
    .mutation(({ input }) => createTodo(input)),
  
  // Get all todo items
  getTodos: publicProcedure
    .query(() => getTodos()),
  
  // Update the text of a todo item
  updateTodoText: publicProcedure
    .input(updateTodoTextInputSchema)
    .mutation(({ input }) => updateTodoText(input)),
  
  // Toggle completion status of a todo item
  toggleTodoCompletion: publicProcedure
    .input(toggleTodoCompletionInputSchema)
    .mutation(({ input }) => toggleTodoCompletion(input)),
  
  // Delete a todo item
  deleteTodo: publicProcedure
    .input(deleteTodoInputSchema)
    .mutation(({ input }) => deleteTodo(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
