
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { Check, X, Edit3, Trash2, Plus, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import type { Todo, CreateTodoInput, UpdateTodoTextInput, ToggleTodoCompletionInput, DeleteTodoInput } from '../../server/src/schema';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isStubMode, setIsStubMode] = useState(false);

  // Local state for stub mode - simulating what the backend would do
  const [nextId, setNextId] = useState(1);

  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setBackendError(null);
      const result = await trpc.getTodos.query();
      setTodos(result);
      setIsStubMode(false);
    } catch (error) {
      console.error('Failed to load todos:', error);
      setBackendError('Backend handlers are placeholder implementations. Using local demo mode.');
      setIsStubMode(true);
      // Initialize with some demo data for better UX
      setTodos([
        {
          id: 1,
          text: 'Welcome to the Todo App! 🎉',
          completed: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          text: 'Try adding, editing, and completing todos',
          completed: false,
          created_at: new Date(Date.now() - 86400000), // 1 day ago
          updated_at: new Date(Date.now() - 86400000)
        },
        {
          id: 3,
          text: 'This is a completed todo example',
          completed: true,
          created_at: new Date(Date.now() - 172800000), // 2 days ago
          updated_at: new Date(Date.now() - 86400000)
        }
      ]);
      setNextId(4);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    setIsCreating(true);
    try {
      const input: CreateTodoInput = { text: newTodoText.trim() };
      
      if (isStubMode) {
        // Local stub implementation
        const newTodo: Todo = {
          id: nextId,
          text: input.text,
          completed: false,
          created_at: new Date(),
          updated_at: new Date()
        };
        setTodos((prev: Todo[]) => [newTodo, ...prev]);
        setNextId(prev => prev + 1);
        setNewTodoText('');
      } else {
        const newTodo = await trpc.createTodo.mutate(input);
        setTodos((prev: Todo[]) => [newTodo, ...prev]);
        setNewTodoText('');
      }
    } catch (error) {
      console.error('Failed to create todo:', error);
      if (!isStubMode) {
        setBackendError('Failed to create todo. Backend handlers are placeholder implementations.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleCompletion = async (id: number, completed: boolean) => {
    try {
      const input: ToggleTodoCompletionInput = { id, completed };
      
      if (isStubMode) {
        // Local stub implementation
        setTodos((prev: Todo[]) =>
          prev.map((todo: Todo) => 
            todo.id === id 
              ? { ...todo, completed, updated_at: new Date() }
              : todo
          )
        );
      } else {
        const updatedTodo = await trpc.toggleTodoCompletion.mutate(input);
        setTodos((prev: Todo[]) =>
          prev.map((todo: Todo) => (todo.id === id ? updatedTodo : todo))
        );
      }
    } catch (error) {
      console.error('Failed to toggle todo completion:', error);
      if (!isStubMode) {
        setBackendError('Failed to toggle todo. Backend handlers are placeholder implementations.');
      }
    }
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingText.trim()) return;

    try {
      const input: UpdateTodoTextInput = { id, text: editingText.trim() };
      
      if (isStubMode) {
        // Local stub implementation
        setTodos((prev: Todo[]) =>
          prev.map((todo: Todo) =>
            todo.id === id
              ? { ...todo, text: input.text, updated_at: new Date() }
              : todo
          )
        );
        setEditingId(null);
        setEditingText('');
      } else {
        const updatedTodo = await trpc.updateTodoText.mutate(input);
        setTodos((prev: Todo[]) =>
          prev.map((todo: Todo) => (todo.id === id ? updatedTodo : todo))
        );
        setEditingId(null);
        setEditingText('');
      }
    } catch (error) {
      console.error('Failed to update todo text:', error);
      if (!isStubMode) {
        setBackendError('Failed to update todo. Backend handlers are placeholder implementations.');
      }
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      const input: DeleteTodoInput = { id };
      
      if (isStubMode) {
        // Local stub implementation
        setTodos((prev: Todo[]) => prev.filter((todo: Todo) => todo.id !== id));
      } else {
        await trpc.deleteTodo.mutate(input);
        setTodos((prev: Todo[]) => prev.filter((todo: Todo) => todo.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete todo:', error);
      if (!isStubMode) {
        setBackendError('Failed to delete todo. Backend handlers are placeholder implementations.');
      }
    }
  };

  const completedTodos = todos.filter((todo: Todo) => todo.completed);
  const incompleteTodos = todos.filter((todo: Todo) => !todo.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="h-8 w-8 text-blue-600" />
            Todo List
          </h1>
          <p className="text-gray-600">Stay organized and productive ✨</p>
        </div>

        {/* Backend Status Alert */}
        {backendError && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Demo Mode:</strong> {backendError} The app is running in local demo mode to showcase functionality.
            </AlertDescription>
          </Alert>
        )}

        {/* Create Todo Form */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Todo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTodo} className="flex gap-2">
              <Input
                placeholder="What needs to be done? 🎯"
                value={newTodoText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTodoText(e.target.value)}
                className="flex-1 border-gray-300 focus:border-blue-500"
                maxLength={500}
              />
              <Button 
                type="submit" 
                disabled={isCreating || !newTodoText.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? 'Adding...' : 'Add'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center bg-white/80 backdrop-blur-sm shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-800">{todos.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/80 backdrop-blur-sm shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{incompleteTodos.length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="text-center bg-white/80 backdrop-blur-sm shadow-md">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{completedTodos.length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Todo List */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Your Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading todos...</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Circle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No todos yet. Add one above! 🚀</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Incomplete Todos */}
                {incompleteTodos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Circle className="h-5 w-5 text-orange-500" />
                      Pending ({incompleteTodos.length})
                    </h3>
                    <div className="space-y-2">
                      {incompleteTodos.map((todo: Todo) => (
                        <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={(checked: boolean) => handleToggleCompletion(todo.id, checked)}
                            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                          
                          {editingId === todo.id ? (
                            <div className="flex-1 flex gap-2">
                              <Textarea
                                value={editingText}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingText(e.target.value)}
                                className="flex-1 min-h-[40px] resize-none"
                                maxLength={500}
                              />
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(todo.id)}
                                  disabled={!editingText.trim()}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-1">
                                <p className="text-gray-800">{todo.text}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Created: {todo.created_at.toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStartEdit(todo)}
                                  className="hover:bg-blue-50"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="hover:bg-red-50">
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Todo</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this todo? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteTodo(todo.id)}
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Separator */}
                {incompleteTodos.length > 0 && completedTodos.length > 0 && (
                  <Separator className="my-4" />
                )}

                {/* Completed Todos */}
                {completedTodos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Completed ({completedTodos.length})
                    </h3>
                    <div className="space-y-2">
                      {completedTodos.map((todo: Todo) => (
                        <div key={todo.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <Checkbox
                            checked={todo.completed}
                            onCheckedChange={(checked: boolean) => handleToggleCompletion(todo.id, checked)}
                            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                          />
                          
                          <div className="flex-1">
                            <p className="text-gray-600 line-through">{todo.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Created: {todo.created_at.toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Done ✓
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="hover:bg-red-50">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Todo</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this completed todo? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTodo(todo.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Built with React, TypeScript, tRPC & Tailwind CSS 💜</p>
          {isStubMode && (
            <p className="mt-1 text-amber-600">
              ⚠️ Running in demo mode - implement backend handlers for full functionality
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
