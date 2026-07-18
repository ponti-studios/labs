import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { DropZone } from "./drop-zone";

const meta = {
  title: "Forms/DropZone",
  component: DropZone,
  tags: ["autodocs"],
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

function DropZonePreview({ isImporting = false }: { isImporting?: boolean }) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="w-96 space-y-3">
      <DropZone
        isImporting={isImporting}
        dragActive={dragActive}
        onDragOver={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDrop={setFiles}
        onChange={setFiles}
        accept=".csv"
        helpText="Supported formats: CSV"
      />
      {files.length > 0 ? (
        <p className="text-muted-foreground text-sm">
          {files.length} file{files.length > 1 ? "s" : ""} selected
        </p>
      ) : null}
    </div>
  );
}

const baseArgs = {
  isImporting: false,
  dragActive: false,
  onDrop: () => {},
  onDragOver: () => {},
  onDragLeave: () => {},
};

export const Default: Story = {
  args: baseArgs,
  render: () => <DropZonePreview />,
};

export const Importing: Story = {
  args: { ...baseArgs, isImporting: true },
  render: () => <DropZonePreview isImporting />,
};
