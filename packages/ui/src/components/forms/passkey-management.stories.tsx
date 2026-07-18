import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { PasskeyManagement, type PasskeyRecord } from "./passkey-management";

const meta = {
  title: "Forms/PasskeyManagement",
  component: PasskeyManagement,
  tags: ["autodocs"],
} satisfies Meta<typeof PasskeyManagement>;

export default meta;
type Story = StoryObj<typeof meta>;

const initialPasskeys: PasskeyRecord[] = [
  { id: "1", name: "MacBook Pro", createdAt: "2025-01-15T00:00:00.000Z" },
  { id: "2", name: "iPhone", createdAt: "2025-03-02T00:00:00.000Z" },
];

function PasskeyManagementPreview({ withError = false }: { withError?: boolean }) {
  const [passkeys, setPasskeys] = useState(initialPasskeys);

  return (
    <div className="w-96">
      <PasskeyManagement
        passkeys={passkeys}
        error={withError ? "Could not delete passkey. Please try again." : null}
        onAdd={async () => {
          setPasskeys((prev) => [
            ...prev,
            {
              id: String(prev.length + 1),
              name: "New device",
              createdAt: new Date().toISOString(),
            },
          ]);
          return true;
        }}
        onDelete={async (id) => {
          setPasskeys((prev) => prev.filter((pk) => pk.id !== id));
          return true;
        }}
      />
    </div>
  );
}

export const Default: Story = {
  args: {
    passkeys: initialPasskeys,
    onAdd: async () => true,
    onDelete: async () => true,
  },
  render: () => <PasskeyManagementPreview />,
};

export const Empty: Story = {
  args: {
    passkeys: [],
    onAdd: async () => true,
    onDelete: async () => true,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
    onAdd: async () => true,
    onDelete: async () => true,
  },
};

export const WithError: Story = {
  args: {
    passkeys: initialPasskeys,
    error: "Could not delete passkey. Please try again.",
    onAdd: async () => true,
    onDelete: async () => true,
  },
  render: () => <PasskeyManagementPreview withError />,
};
