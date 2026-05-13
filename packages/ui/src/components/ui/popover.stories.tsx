import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const meta: Meta<typeof Popover> = {
  component: Popover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center justify-center h-32">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent align="center" sideOffset={4}>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold leading-none">Edit profile</p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="popover-name">Display name</Label>
              <Input id="popover-name" placeholder="Your name" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="popover-username">Username</Label>
              <Input id="popover-username" placeholder="@handle" />
            </div>
            <Button size="sm">Save changes</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const AlignStart: Story = {
  render: () => (
    <div className="flex items-center justify-start h-32 pl-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover (start)</Button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={4}>
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold leading-none">Notification settings</p>
            <div className="flex flex-col gap-2">
              <Label htmlFor="popover-email-start">Notify email</Label>
              <Input id="popover-email-start" type="email" placeholder="you@example.com" />
            </div>
            <Button size="sm">Save</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
