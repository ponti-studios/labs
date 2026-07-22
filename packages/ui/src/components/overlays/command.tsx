import { Combobox as CommandPrimitive } from "@base-ui/react/combobox";
import { SearchIcon } from "lucide-react";
import * as React from "react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";

function Command({ className, children, ...props }: Omit<React.ComponentProps<typeof CommandPrimitive.Root<string>>, "className"> & { className?: string }) {
  return (
    <div data-slot="command" className={`bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md ${className ?? ""}`}>
      <CommandPrimitive.Root {...props}>{children}</CommandPrimitive.Root>
    </div>
  );
}

function CommandDialog({ title = "Command Palette", description = "Search for a command to run...", children, showCloseButton = true, ...props }: Omit<React.ComponentProps<typeof Dialog>, "children"> & { title?: string; description?: string; showCloseButton?: boolean; children?: React.ReactNode }) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only"><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
      <DialogContent className="overflow-hidden p-0" showCloseButton={showCloseButton}><Command>{children}</Command></DialogContent>
    </Dialog>
  );
}

type CommandInputProps = React.ComponentProps<typeof CommandPrimitive.Input> & { onValueChange?: (value: string) => void };

function CommandInput({ className, onValueChange, onChange, "aria-label": ariaLabel = "Search commands", ...props }: CommandInputProps) {
  return (
    <div data-slot="command-input-wrapper" className="flex h-9 items-center gap-2 border-b px-3">
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        aria-label={ariaLabel}
        className={`placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
        onChange={(event) => { onChange?.(event); onValueChange?.(event.currentTarget.value); }}
        {...props}
      />
    </div>
  );
}

function CommandList(props: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List data-slot="command-list" aria-label="Command results" tabIndex={0} className="max-h-75 scroll-py-1 overflow-x-hidden overflow-y-auto" {...props} />;
}

function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" role="option" aria-disabled="true" className="py-6 text-center text-sm" {...props} />;
}

function CommandGroup({ className, heading, children, ...props }: React.ComponentProps<typeof CommandPrimitive.Group> & { heading?: React.ReactNode }) {
  return (
    <CommandPrimitive.Group data-slot="command-group" className={`text-foreground overflow-hidden p-1 ${className ?? ""}`} {...props}>
      {heading ? <CommandPrimitive.GroupLabel className="text-muted-foreground px-2 py-1.5 text-xs font-medium">{heading}</CommandPrimitive.GroupLabel> : null}
      {children}
    </CommandPrimitive.Group>
  );
}

type CommandItemProps = React.ComponentProps<typeof CommandPrimitive.Item> & { onSelect?: () => void };

function CommandItem({ className, onSelect, onClick, ...props }: CommandItemProps) {
  return <CommandPrimitive.Item data-slot="command-item" className={`data-highlighted:bg-accent data-highlighted:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 ${className ?? ""}`} onClick={(event) => { onClick?.(event); onSelect?.(); }} {...props} />;
}

function CommandSeparator(props: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return <CommandPrimitive.Separator data-slot="command-separator" role="option" aria-disabled="true" aria-hidden="true" className="bg-border -mx-1 h-px" {...props} />;
}

function CommandShortcut(props: React.ComponentProps<"span">) {
  return <span data-slot="command-shortcut" className="text-muted-foreground ml-auto text-xs tracking-widest" {...props} />;
}

function CommandListLoading(props: React.ComponentProps<"div">) {
  return <div data-slot="command-list-loading" className="py-6 text-center text-sm" {...props} />;
}

export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandListLoading, CommandSeparator, CommandShortcut };
