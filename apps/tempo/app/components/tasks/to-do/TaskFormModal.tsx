import {
  Button,
  Calendar,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@pontistudios/ui";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useProjects } from "~/lib/projects";
import type { TodoCreateData, TodoItem } from "~/lib/todos";

interface DateRangeValue {
  from: Date | undefined;
  to?: Date;
}

interface TaskFormModalProps {
  onSubmit: (todo: TodoCreateData | TodoItem) => void;
  isLoading?: boolean;
  error?: string | null;
  trigger?: React.ReactNode;
  todo?: TodoItem;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskFormModal({
  onSubmit,
  isLoading = false,
  error: externalError,
  trigger,
  todo,
  open: controlledOpen,
  onOpenChange,
}: TaskFormModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    start: "",
    end: "",
  });
  const [projectError, setProjectError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>(undefined);

  const isEditing = !!todo;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  useEffect(() => {
    if (todo) {
      setFormData({
        projectId: todo.projectId?.toString() || "",
        title: todo.title,
        start: todo.start,
        end: todo.end,
      });
      setDateRange({
        from: todo.start ? new Date(`${todo.start}T00:00:00`) : undefined,
        to: todo.end ? new Date(`${todo.end}T00:00:00`) : undefined,
      });
    }
  }, [todo]);

  useEffect(() => {
    if (!open && !isEditing) {
      setFormData({ projectId: "", title: "", start: "", end: "" });
      setProjectError(null);
      setDateRange(undefined);
    }
  }, [isEditing, open]);

  const dateRangeLabel = useMemo(() => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(dateRange.to, "MMM dd, yyyy")}`;
    }

    if (dateRange?.from) {
      return format(dateRange.from, "MMM dd, yyyy");
    }

    return "Pick a date range";
  }, [dateRange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProjectError(null);

    if (!formData.title.trim()) return;

    let projectId: number | null = null;
    if (formData.projectId) {
      projectId = Number.parseInt(formData.projectId);
    }

    if (projectId !== null && Number.isNaN(projectId)) {
      setProjectError("Please select a valid project");
      return;
    }

    if (isEditing && todo) {
      onSubmit({
        ...todo,
        projectId,
        title: formData.title,
        start: formData.start || new Date().toISOString().split("T")[0],
        end: formData.end || new Date().toISOString().split("T")[0],
      } satisfies TodoItem);
    } else {
      onSubmit({
        projectId,
        title: formData.title,
        start: formData.start || new Date().toISOString().split("T")[0],
        end: formData.end || new Date().toISOString().split("T")[0],
        completed: false,
      } satisfies TodoCreateData);
    }
  };

  const handleCancel = () => {
    setProjectError(null);
    if (!isEditing) {
      setFormData({ projectId: "", title: "", start: "", end: "" });
    }
    setOpen(false);
  };

  const displayError = projectError || externalError;

  const modalContent = (
    <SheetContent
      side="bottom"
      className="mx-auto max-h-[90vh] w-full max-w-[350px] rounded-t-2xl border border-border bg-popover shadow-none"
    >
      <SheetHeader>
        <SheetTitle>{isEditing ? "Edit Todo" : "Add New Todo"}</SheetTitle>
        <SheetDescription>
          {isEditing
            ? "Update the todo details below."
            : "Create a new todo item. Fill in the details below."}
        </SheetDescription>
      </SheetHeader>
      <form onSubmit={handleSubmit} className="overflow-y-auto">
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full"
              placeholder="Enter task title"
              autoFocus
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="project" className="text-right">
              Project
            </Label>
            <select
              id="project"
              value={formData.projectId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setProjectError(null);
                setFormData({ ...formData, projectId: e.target.value });
              }}
              className="col-span-3 flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={projectsLoading}
              aria-describedby="project-error"
            >
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Date range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="size-4" />
                  <span>{dateRangeLabel}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    setFormData({
                      ...formData,
                      start: range?.from ? format(range.from, "yyyy-MM-dd") : "",
                      end: range?.to ? format(range.to, "yyyy-MM-dd") : range?.from ? format(range.from, "yyyy-MM-dd") : "",
                    });
                  }}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        {displayError && (
          <p id="project-error" role="alert" className="mb-3 text-sm text-red-600">
            {displayError}
          </p>
        )}
        <SheetFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || projectsLoading}>
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
                ? "Update Todo"
                : "Add Todo"}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  );

  if (controlledOpen !== undefined) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        {modalContent}
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger || <Button size="sm">Add New Todo</Button>}</SheetTrigger>
      {modalContent}
    </Sheet>
  );
}
