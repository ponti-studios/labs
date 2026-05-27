import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@pontistudios/ui";
import { PenSquare } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { TaskFormModal } from "~/components/tasks/to-do/TaskFormModal";
import { TaskList } from "~/components/tasks/to-do/TaskList";
import { buildTaskFilterInput, filterTodos, parseTaskFilterInput, slugifyProjectName } from "~/lib/taskFilters";
import type { TodoCreateData, TodoItem } from "~/lib/todos";
import { useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo } from "~/lib/todos";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable
    || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: todos = [], isLoading, error } = useTodos();
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  const composeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const filters = useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      project: searchParams.get("project") ?? "",
    }),
    [searchParams],
  );

  const [searchInputValue, setSearchInputValue] = useState(buildTaskFilterInput(filters));

  useEffect(() => {
    setSearchInputValue(buildTaskFilterInput(filters));
  }, [filters]);

  const filteredTodos = useMemo(() => filterTodos(todos, filters), [filters, todos]);
  const activeFilterCount = Number(Boolean(filters.search)) + Number(Boolean(filters.project));

  const updateFilters = (next: { search: string; project: string }) => {
    const params = new URLSearchParams(searchParams);

    if (next.search) {
      params.set("search", next.search);
    } else {
      params.delete("search");
    }

    if (next.project) {
      params.set("project", next.project);
    } else {
      params.delete("project");
    }

    setSearchParams(params, { replace: true });
  };

  const openCreateModal = () => {
    lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIsCreateOpen(true);
  };

  const openSearch = () => {
    lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSearchInputValue(buildTaskFilterInput(filters));
    setIsSearchOpen(true);
  };

  const restoreFocus = () => {
    window.setTimeout(() => {
      lastFocusedRef.current?.focus();
      if (!lastFocusedRef.current) {
        composeButtonRef.current?.focus();
      }
    }, 0);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const hasModifier = event.ctrlKey || event.metaKey;
      if (!hasModifier) {
        return;
      }

      const key = event.key.toLowerCase();
      if (isEditableTarget(event.target) && !isSearchOpen && !isCreateOpen && !editingTodo) {
        return;
      }

      if (key === "o") {
        if (isCreateOpen || isSearchOpen) {
          return;
        }
        event.preventDefault();
        openCreateModal();
      }

      if (key === "k") {
        if (isSearchOpen || isCreateOpen) {
          return;
        }
        event.preventDefault();
        openSearch();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingTodo, isCreateOpen, isSearchOpen, filters]);

  const handleCreateTodo = (todo: TodoCreateData | TodoItem) => {
    if ("id" in todo) {
      return;
    }

    createTodoMutation.mutate(todo, {
      onSuccess: () => {
        setIsCreateOpen(false);
      },
    });
  };

  const handleUpdateTodo = (todo: TodoCreateData | TodoItem) => {
    if (!("id" in todo)) {
      return;
    }

    updateTodoMutation.mutate(todo, {
      onSuccess: () => {
        setEditingTodo(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="text-center text-red-500">Error loading tasks: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{filteredTodos.length} visible</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {filters.search ? `“${filters.search}”` : "Filtered"}
                {filters.project ? ` #${filters.project}` : ""}
              </Badge>
            )}
            <span>Ctrl/Cmd+O create</span>
            <span>Ctrl/Cmd+K filter</span>
          </div>
        </div>
        <Button
          ref={composeButtonRef}
          variant="outline"
          size="sm"
          aria-label="Create task"
          onClick={openCreateModal}
          className="rounded-full px-3"
        >
          <PenSquare className="size-4" />
          <span>New task</span>
        </Button>
      </div>

      <TaskList
        todos={filteredTodos}
        onDelete={(id) => deleteTodoMutation.mutate(id)}
        isDeletePending={deleteTodoMutation.isPending}
        onEdit={(todo) => setEditingTodo(todo)}
        emptyStateTitle={activeFilterCount > 0 ? "No matching tasks" : "No tasks yet"}
        emptyStateDescription={
          activeFilterCount > 0
            ? "Try a different title search or project slug."
            : "Press Ctrl/Cmd+O or use the pencil button to create your first task."
        }
      />

      <TaskFormModal
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            restoreFocus();
          }
        }}
        onSubmit={handleCreateTodo}
        isLoading={createTodoMutation.isPending}
        error={createTodoMutation.error?.message}
      />

      {editingTodo && (
        <TaskFormModal
          todo={editingTodo}
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setEditingTodo(null);
              restoreFocus();
            }
          }}
          onSubmit={handleUpdateTodo}
          isLoading={updateTodoMutation.isPending}
          error={updateTodoMutation.error?.message}
        />
      )}

      <Sheet
        open={isSearchOpen}
        onOpenChange={(open) => {
          setIsSearchOpen(open);
          if (!open) {
            restoreFocus();
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[80vh] w-full max-w-[350px] rounded-t-2xl border border-border bg-popover p-0 shadow-none"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Filter tasks</SheetTitle>
            <SheetDescription>Filter tasks by title or project slug.</SheetDescription>
          </SheetHeader>
          <Command
            loop
            value={searchInputValue}
            onValueChange={(value) => {
              setSearchInputValue(value);
              updateFilters(parseTaskFilterInput(value));
            }}
            className="rounded-2xl"
          >
            <CommandInput autoFocus placeholder="Filter tasks or type #project-slug" />
            <CommandList className="max-h-[22rem] p-2">
              <CommandEmpty>No tasks match this filter.</CommandEmpty>
              {filteredTodos.map((todo) => {
                const projectSlug = todo.projectName ? slugifyProjectName(todo.projectName) : "";

                return (
                  <CommandItem
                    key={todo.id}
                    value={`${todo.title} ${projectSlug} ${todo.projectName ?? ""}`}
                    onSelect={() => {
                      setEditingTodo(todo);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between rounded-xl px-3 py-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{todo.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {todo.start} - {todo.end}
                      </span>
                    </div>
                    {todo.projectName && <Badge variant="secondary">#{projectSlug}</Badge>}
                  </CommandItem>
                );
              })}
            </CommandList>
          </Command>
        </SheetContent>
      </Sheet>
    </div>
  );
}
