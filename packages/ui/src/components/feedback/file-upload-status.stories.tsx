import type { Meta, StoryObj } from "@storybook/react-vite";

import { FileUploadStatus } from "./file-upload-status";

const meta = {
  title: "Feedback/FileUploadStatus",
  component: FileUploadStatus,
  tags: ["autodocs"],
} satisfies Meta<typeof FileUploadStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uploading: Story = {
  render: () => (
    <div className="w-80">
      <FileUploadStatus uploadStatus={{ status: "uploading", stats: { progress: 42 } }} />
    </div>
  ),
};

export const Queued: Story = {
  render: () => (
    <div className="w-80">
      <FileUploadStatus uploadStatus={{ status: "queued" }} />
    </div>
  ),
};

export const Done: Story = {
  render: () => (
    <div className="w-80">
      <FileUploadStatus
        uploadStatus={{
          status: "done",
          stats: {
            processingTime: 4200,
            total: 128,
            created: 90,
            updated: 30,
            skipped: 8,
          },
        }}
      />
    </div>
  ),
};

export const Error: Story = {
  render: () => (
    <div className="w-80">
      <FileUploadStatus
        uploadStatus={{ status: "error", error: "Could not parse the CSV file." }}
      />
    </div>
  ),
};
