import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { CalendarIcon, FolderIcon, SettingsIcon, SmileIcon, UserIcon } from "lucide-react";

import { Button } from "./button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";

const meta: Meta<typeof Command> = {
  component: Command,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

function CommandContent() {
  return (
    <>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <CalendarIcon />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <SmileIcon />
            <span>Search Emoji</span>
          </CommandItem>
          <CommandItem>
            <FolderIcon />
            <span>Browse Files</span>
            <CommandShortcut>⌘B</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>
            <UserIcon />
            <span>Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <SettingsIcon />
            <span>Settings</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-full max-w-md">
      <CommandContent />
    </Command>
  ),
};

export const WithDialog: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-sm text-muted-foreground">
          Press the button or{" "}
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>{" "}
          to open the command palette.
        </p>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open Command Palette
        </Button>
        <CommandDialog
          open={open}
          onOpenChange={setOpen}
          title="Command Palette"
          description="Search for a command to run..."
        >
          <CommandContent />
        </CommandDialog>
      </div>
    );
  },
};

export const Empty: Story = {
  render: () => (
    <Command className="rounded-lg border shadow-md w-full max-w-md">
      <CommandInput placeholder="Type something obscure..." defaultValue="xyzzy" />
      <CommandList>
        <CommandEmpty>No results found for your query.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <CalendarIcon />
            <span>Calendar</span>
          </CommandItem>
          <CommandItem>
            <SmileIcon />
            <span>Search Emoji</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
