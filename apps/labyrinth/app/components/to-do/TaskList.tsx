import type { Todo } from "~/lib/todos";

export function TaskList({ todos }: { todos: Todo[] }) {
  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div key={todo.id} className="rounded-md border border-white/10 bg-white/5 p-3">
          {todo.title}
        </div>
      ))}
      {todos.length === 0 && <p className="text-sm text-white/60">No tasks yet.</p>}
    </div>
  );
}
