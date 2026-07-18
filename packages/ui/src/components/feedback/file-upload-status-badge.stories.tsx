import type { Meta, StoryObj } from "@storybook/react-vite";

import { FileUploadStatusBadge } from "./file-upload-status-badge";

const meta = {
  title: "Feedback/FileUploadStatusBadge",
  component: FileUploadStatusBadge,
  tags: ["autodocs"],
} satisfies Meta<typeof FileUploadStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { status: "uploading" },
};

export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <FileUploadStatusBadge status="uploading" />
      <FileUploadStatusBadge status="processing" />
      <FileUploadStatusBadge status="queued" />
      <FileUploadStatusBadge status="done" />
      <FileUploadStatusBadge status="error" />
    </div>
  ),
};
