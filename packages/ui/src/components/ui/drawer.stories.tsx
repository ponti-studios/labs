import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Button } from "./button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

const meta: Meta = {
  component: Drawer,
  tags: ["autodocs"],
};

export default meta;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Story = StoryObj<any>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <div className="flex items-center justify-center p-8">
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline">Open Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4 py-2">
              <p className="text-sm text-muted-foreground">
                All of your saved preferences, history, and personal information will be erased. You
                will lose access to any premium features associated with your account.
              </p>
            </div>
            <DrawerFooter>
              <Button variant="destructive" onClick={() => setOpen(false)}>
                Delete account
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    );
  },
};
