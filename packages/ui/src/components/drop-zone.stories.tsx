import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { hiddenControl, selectControl } from "../storybook/controls";
import { DropZone, type DropZoneFileInfo, type DropZoneStatus } from "./drop-zone";

const statusOptions: DropZoneStatus[] = ["empty", "armed", "busy", "failed"];

const meta = {
  title: "Patterns/Input/DropZone",
  component: DropZone,
  tags: ["autodocs"],
  argTypes: {
    status: selectControl(statusOptions, "Current drop zone state", { defaultValue: "empty" }),
    onFiles: hiddenControl,
    onSubmit: hiddenControl,
    onClear: hiddenControl,
    onCancel: hiddenControl,
    onRetry: hiddenControl,
    file: hiddenControl,
    error: hiddenControl,
  },
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

function DropZonePreview({ status: initialStatus }: { status: DropZoneStatus }) {
  const [status, setStatus] = useState<DropZoneStatus>(initialStatus);
  const [file, setFile] = useState<DropZoneFileInfo | null>(
    initialStatus === "empty" ? null : { name: "quarterly-report.pdf", size: 482_331 },
  );

  return (
    <div className="w-[420px]">
      <DropZone
        status={status}
        file={file}
        error={status === "failed" ? "Upload failed — file exceeds 10 MB limit." : null}
        onFiles={(files) => {
          const [first] = files;
          if (!first) return;
          setFile({ name: first.name, size: first.size });
          setStatus("armed");
        }}
        onSubmit={() => setStatus("busy")}
        onClear={() => {
          setFile(null);
          setStatus("empty");
        }}
        onCancel={() => setStatus("armed")}
        onRetry={() => setStatus("busy")}
      />
    </div>
  );
}

export const Empty: Story = {
  args: {
    status: "empty",
    onFiles: () => {},
  },
  render: (args) => <DropZonePreview status={args.status} />,
};

export const Armed: Story = {
  args: {
    status: "armed",
    onFiles: () => {},
  },
  render: (args) => <DropZonePreview status={args.status} />,
};

export const Busy: Story = {
  args: {
    status: "busy",
    onFiles: () => {},
  },
  render: (args) => <DropZonePreview status={args.status} />,
};

export const Failed: Story = {
  args: {
    status: "failed",
    onFiles: () => {},
  },
  render: (args) => <DropZonePreview status={args.status} />,
};
