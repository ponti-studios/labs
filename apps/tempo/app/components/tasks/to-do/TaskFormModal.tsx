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
  TokenInput,
  type TokenInputItem,
} from "@pontistudios/ui";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_TAG_COLOR,
  normalizeTagName,
  useTags,
  type TagItem,
} from "~/lib/tags";
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

function createLocalTag(name: string): TagItem {
  const normalizedName = normalizeTagName(name);

  return {
    id: -Date.now(),
    userId: "demo-user",
    name: normalizedName,
    normalizedName,
    color: DEFAULT_TAG_COLOR,
    createdAt: null,
    updatedAt: null,
  };
}

function toTokenItem(tag: TagItem): TokenInputItem {
  return {
    value: tag.normalizedName,
    label: tag.name,
    color: tag.color,
  };
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
    title: "",
    start: "",
    end: "",
  });
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  const [tagInputValue, setTagInputValue] = useState("");
  const [tagMessage, setTagMessage] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>(undefined);
  const [showTagField, setShowTagField] = useState(false);
  const [showDateField, setShowDateField] = useState(false);

  const isEditing = !!todo;
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const { data: tags = [] } = useTags();

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        start: todo.start,
        end: todo.end,
      });
      setSelectedTags(todo.tags);
      setDateRange({
        from: todo.start ? new Date(`${todo.start}T00:00:00`) : undefined,
        to: todo.end ? new Date(`${todo.end}T00:00:00`) : undefined,
      });
      setShowTagField(false);
      setShowDateField(!!todo.start || !!todo.end);
      setTagInputValue("");
      setTagMessage(null);
    }
  }, [todo]);

  useEffect(() => {
    if (!open && !isEditing) {
      setFormData({ title: "", start: "", end: "" });
      setSelectedTags([]);
      setTagInputValue("");
      setTagMessage(null);
      setDateRange(undefined);
      setShowTagField(false);
      setShowDateField(false);
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

  const normalizedTagInput = normalizeTagName(tagInputValue);
  const selectedTagNames = new Set(selectedTags.map((tag) => tag.normalizedName));

  const duplicateSelectionMessage = normalizedTagInput && selectedTagNames.has(normalizedTagInput)
    ? `"${normalizedTagInput}" already exists and is selected.`
    : null;

  const suggestedTags = useMemo(() => {
    if (!normalizedTagInput) {
      return [];
    }

    return tags.filter((tag) => {
      if (selectedTagNames.has(tag.normalizedName)) {
        return false;
      }

      return tag.normalizedName.includes(normalizedTagInput);
    });
  }, [normalizedTagInput, selectedTagNames, tags]);

  const addTag = (tag: TagItem) => {
    setSelectedTags((current) => [...current, tag]);
    setTagInputValue("");
    setTagMessage(null);
    setShowTagField(false);
  };

  const handleAddTag = () => {
    if (!normalizedTagInput) {
      return;
    }

    if (selectedTagNames.has(normalizedTagInput)) {
      setTagMessage(`"${normalizedTagInput}" already exists and is selected.`);
      return;
    }

    const existingTag = tags.find((tag) => tag.normalizedName === normalizedTagInput);
    addTag(existingTag ?? createLocalTag(normalizedTagInput));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.title.trim()) {
      return;
    }

    if (isEditing && todo) {
      onSubmit({
        ...todo,
        title: formData.title.trim(),
        start: formData.start || new Date().toISOString().split("T")[0],
        end: formData.end || new Date().toISOString().split("T")[0],
        tags: selectedTags,
      } satisfies TodoItem);
      return;
    }

    onSubmit({
      title: formData.title.trim(),
      start: formData.start || new Date().toISOString().split("T")[0],
      end: formData.end || new Date().toISOString().split("T")[0],
      tags: selectedTags.map((tag) => tag.name),
      completed: false,
    } satisfies TodoCreateData);
  };

  const handleCancel = () => {
    setTagInputValue("");
    setTagMessage(null);
    if (!isEditing) {
      setFormData({ title: "", start: "", end: "" });
      setSelectedTags([]);
      setDateRange(undefined);
      setShowTagField(false);
      setShowDateField(false);
    }
    setOpen(false);
  };

  const tagFeedback = tagMessage || duplicateSelectionMessage;

  const modalContent = (
    <SheetContent
      side="bottom"
      className="mx-auto max-h-[90vh] w-full max-w-96 rounded-t-2xl border border-border bg-popover"
    >
      <SheetHeader>
        <SheetTitle>{isEditing ? "Edit task" : "Add new task"}</SheetTitle>
        <SheetDescription>
          {isEditing
            ? "Update the task details below."
            : "Create a new task. Only the title is required."}
        </SheetDescription>
      </SheetHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              className="w-full"
              placeholder="Enter task title"
              autoFocus
              required
            />
          </div>

          <TokenInput
            tokens={selectedTags.map(toTokenItem)}
            suggestions={suggestedTags.map(toTokenItem)}
            inputValue={tagInputValue}
            isOpen={showTagField}
            addLabel="Tag"
            placeholder="Search or create a tag"
            emptyMessage="No matching tags"
            duplicateMessage={tagFeedback}
            helperMessage={
              normalizedTagInput && suggestedTags.length === 0
                ? `Press Enter to create "${normalizedTagInput}"`
                : null
            }
            onOpenChange={(nextOpen) => {
              setShowTagField(nextOpen);
              if (!nextOpen) {
                setTagInputValue("");
                setTagMessage(null);
              }
            }}
            onInputValueChange={(value) => {
              setTagInputValue(value);
              setTagMessage(null);
            }}
            onAdd={handleAddTag}
            onSelectSuggestion={(item) => {
              const existingTag = tags.find((tag) => tag.normalizedName === item.value);
              if (existingTag) {
                addTag(existingTag);
              }
            }}
            onRemove={(item) => {
              setSelectedTags((current) =>
                current.filter((tag) => tag.normalizedName !== item.value),
              );
              setTagMessage(null);
            }}
          />

          <div className="flex flex-wrap gap-2">
            {showDateField ? (
              <div className="flex w-full items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateRange(undefined);
                    setFormData({ ...formData, start: "", end: "" });
                    setShowDateField(false);
                  }}
                  className="rounded-full px-3"
                >
                  <span>{dateRangeLabel}</span>
                  <X className="size-3.5" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 justify-start text-left font-normal"
                    >
                      <CalendarIcon className="size-4" />
                      <span>{dateRange?.from ? "Edit dates" : "Choose dates"}</span>
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
                          end: range?.to
                            ? format(range.to, "yyyy-MM-dd")
                            : range?.from
                              ? format(range.from, "yyyy-MM-dd")
                              : "",
                        });
                      }}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowDateField(true)}
                className="rounded-full px-3"
              >
                <Plus className="size-3.5" />
                <span>Dates</span>
              </Button>
            )}
          </div>
        </div>

        {externalError && (
          <p role="alert" className="mb-3 text-sm text-red-600">
            {externalError}
          </p>
        )}

        <SheetFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? isEditing
                ? "Updating..."
                : "Adding..."
              : isEditing
                ? "Update task"
                : "Add task"}
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
      <SheetTrigger asChild>{trigger || <Button size="sm">Add new task</Button>}</SheetTrigger>
      {modalContent}
    </Sheet>
  );
}
