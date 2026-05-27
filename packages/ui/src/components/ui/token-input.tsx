import * as React from "react";
import { Plus, X } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";

export interface TokenInputItem {
  value: string;
  label: string;
  color?: string | null;
}

interface TokenInputProps {
  tokens: TokenInputItem[];
  suggestions: TokenInputItem[];
  inputValue: string;
  isOpen: boolean;
  placeholder?: string;
  addLabel?: string;
  emptyMessage?: string;
  duplicateMessage?: string | null;
  helperMessage?: string | null;
  onOpenChange: (open: boolean) => void;
  onInputValueChange: (value: string) => void;
  onAdd: () => void;
  onSelectSuggestion: (item: TokenInputItem) => void;
  onRemove: (item: TokenInputItem) => void;
}

function getTokenStyle(color?: string | null): React.CSSProperties | undefined {
  if (!color) {
    return undefined;
  }

  return {
    borderColor: `${color}66`,
    backgroundColor: `${color}1A`,
  };
}

export const TokenInput = React.forwardRef<HTMLInputElement, TokenInputProps>(
  (
    {
      tokens,
      suggestions,
      inputValue,
      isOpen,
      placeholder = "Add a tag",
      addLabel = "Tag",
      emptyMessage = "No matching tags",
      duplicateMessage,
      helperMessage,
      onOpenChange,
      onInputValueChange,
      onAdd,
      onSelectSuggestion,
      onRemove,
    },
    forwardedRef,
  ) => {
    const addButtonRef = React.useRef<HTMLButtonElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (isOpen) {
        inputRef.current?.focus();
      }
    }, [isOpen]);

    const closeInput = React.useCallback(() => {
      onInputValueChange("");
      onOpenChange(false);
      window.setTimeout(() => {
        addButtonRef.current?.focus();
      }, 0);
    }, [onInputValueChange, onOpenChange]);

    const showSuggestions = isOpen && inputValue.trim().length > 0 && suggestions.length > 0;

    return (
      <div className="grid gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {tokens.map((token) => (
            <Badge
              key={token.value}
              variant="outline"
              className="gap-1 rounded-full px-2 py-1 text-xs font-medium"
              style={getTokenStyle(token.color)}
            >
              <span>{token.label}</span>
              <button
                type="button"
                aria-label={`Remove ${token.label}`}
                className="inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => onRemove(token)}
                onKeyDown={(event) => {
                  if (event.key === "Backspace" || event.key === "Delete") {
                    event.preventDefault();
                    onRemove(token);
                  }
                }}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}

          {isOpen ? (
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(event) => onInputValueChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAdd();
                }

                if (event.key === "Escape") {
                  event.preventDefault();
                  closeInput();
                }
              }}
              placeholder={placeholder}
              className="h-8 w-auto min-w-40 flex-1 rounded-full"
            />
          ) : (
            <Button
              ref={addButtonRef}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(true)}
              className="rounded-full px-3"
            >
              <Plus className="size-3.5" />
              <span>{addLabel}</span>
            </Button>
          )}
        </div>

        {duplicateMessage && (
          <p role="status" className="text-sm text-muted-foreground">
            {duplicateMessage}
          </p>
        )}

        {helperMessage && !duplicateMessage && (
          <p className="text-sm text-muted-foreground">
            {helperMessage}
          </p>
        )}

        {showSuggestions && (
          <div className="rounded-2xl border border-border bg-card p-1">
            <div className="grid gap-1">
              {suggestions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => onSelectSuggestion(item)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-accent",
                  )}
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-muted-foreground">Use existing</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  },
);

TokenInput.displayName = "TokenInput";
