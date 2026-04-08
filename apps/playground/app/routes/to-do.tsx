import type React from 'react';
import { useEffect, useState } from 'react';

interface TodoItem {
  id: number;
  task: string;
  date: string;
  completed: boolean;
}

export default function Todo() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    // Load tasks from Local Storage
    if (localStorage.tasks) {
      setTodos(JSON.parse(localStorage.tasks));
    }
  }, []);

  useEffect(() => {
    // Save tasks to Local Storage whenever todos change
    localStorage.setItem('tasks', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.length > 1) {
      const newTodo: TodoItem = {
        id: todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1,
        task,
        date: dueDate || new Date().toISOString().split('T')[0],
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setTask('');
      setDueDate('');
    }
  };

  const toggleComplete = (id: number) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div id="container">
      <header>
        <h1>Meow To Dos</h1>
      </header>

      <div className="kitty-cat">
        <img src="/assets/images/cat.jpg" alt="Cat" />
      </div>

      <section className="to-dos">
        <ul id="toDoList">
          {todos.map((todo) => (
            <li key={todo.id}>
              <label htmlFor={`todo-${todo.id}`} className={todo.completed ? 'finished' : ''}>
                <input
                  type="checkbox"
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo.id)}
                />
                {todo.task}
                <button type="button" onClick={() => deleteTodo(todo.id)}>
                  Delete!
                </button>
              </label>
            </li>
          ))}
        </ul>

        <section className="to-do-form">
          <form onSubmit={addTodo}>
            <input
              type="text"
              name="task"
              placeholder="New Task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />
            <input
              type="date"
              name="due_date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <button type="submit">Add Task</button>
          </form>
        </section>
      </section>
    </div>
  );
}
