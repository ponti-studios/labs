import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckCircle, Clock, XCircle } from "lucide-react";

import { StatusBadge, type StatusBadgeConfig } from "./status-badge";

type ConnectionStatus = "active" | "error" | "pending" | "revoked";

const connectionStatusConfig: Record<ConnectionStatus, StatusBadgeConfig> = {
  active: { label: "Active", variant: "default", icon: <CheckCircle className="mr-1 size-3" /> },
  error: { label: "Error", variant: "destructive", icon: <XCircle className="mr-1 size-3" /> },
  pending: { label: "Pending", variant: "secondary", icon: <Clock className="mr-1 size-3" /> },
  revoked: { label: "Revoked", variant: "outline" },
};

const meta = {
  title: "Primitives/StatusBadge",
  component: StatusBadge<ConnectionStatus>,
  tags: ["autodocs"],
} satisfies Meta<typeof StatusBadge<ConnectionStatus>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    status: "active",
    config: connectionStatusConfig,
  },
};

export const AllStatuses: Story = {
  args: {
    status: "active",
    config: connectionStatusConfig,
  },
  render: () => (
    <div className="flex flex-wrap gap-2">
      <StatusBadge status="active" config={connectionStatusConfig} />
      <StatusBadge status="error" config={connectionStatusConfig} />
      <StatusBadge status="pending" config={connectionStatusConfig} />
      <StatusBadge status="revoked" config={connectionStatusConfig} />
    </div>
  ),
};

export const WithFallback: Story = {
  args: {
    status: null,
    config: connectionStatusConfig,
    fallback: { label: "Unknown", variant: "outline" },
  },
};
