import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-sm font-semibold">Account settings</p>
          <p className="text-sm text-muted-foreground">
            Update your display name, avatar, and linked accounts.
          </p>
          <div className="pt-1 space-y-2">
            <input
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Display name"
            />
            <input
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Email address"
              type="email"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="password">
        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-sm font-semibold">Change password</p>
          <p className="text-sm text-muted-foreground">
            After saving, you'll be logged out of all other sessions.
          </p>
          <div className="pt-1 space-y-2">
            <input
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Current password"
              type="password"
            />
            <input
              className="flex h-9 w-full rounded-md border border-border bg-transparent px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="New password"
              type="password"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="notifications">
        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-sm font-semibold">Notification preferences</p>
          <p className="text-sm text-muted-foreground">
            Choose how and when you want to be notified.
          </p>
          <div className="pt-1 space-y-2 text-sm">
            {["Email digests", "Push notifications", "Weekly summary"].map((item) => (
              <label key={item} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                {item}
              </label>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="account" orientation="vertical" className="flex gap-4 w-full max-w-lg">
      <TabsList className="flex flex-col h-auto w-36 shrink-0">
        <TabsTrigger value="account" className="w-full justify-start">
          Account
        </TabsTrigger>
        <TabsTrigger value="password" className="w-full justify-start">
          Password
        </TabsTrigger>
        <TabsTrigger value="notifications" className="w-full justify-start">
          Notifications
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 min-w-0">
        <TabsContent value="account">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-semibold">Account settings</p>
            <p className="text-sm text-muted-foreground">
              Manage your display name, avatar, and linked accounts.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="password">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-semibold">Change password</p>
            <p className="text-sm text-muted-foreground">
              After saving, you'll be logged out of all other sessions.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="notifications">
          <div className="rounded-lg border p-4 space-y-2">
            <p className="text-sm font-semibold">Notification preferences</p>
            <p className="text-sm text-muted-foreground">
              Choose how and when you want to be notified.
            </p>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  ),
};
