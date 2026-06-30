import type { Meta, StoryObj } from "@storybook/react-vite";

import { InboxStreamRow } from "./inbox-stream-row";

const meta = {
  title: "Patterns/Inbox/InboxStreamRow",
  component: InboxStreamRow,
  tags: ["autodocs"],
} satisfies Meta<typeof InboxStreamRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ChatRow: Story = {
  args: {
    item: {
      kind: "chat",
      entityId: "c_1",
      title: "Studio approvals",
      preview: "Need sign-off on the next release pass.",
      updatedAt: "2024-01-15T10:00:00.000Z",
    },
  },
};

export const NoteRow: Story = {
  args: {
    item: {
      kind: "note",
      entityId: "n_1",
      preview: "Drafted a migration checklist for the mirror package.",
      updatedAt: "2024-01-14T10:00:00.000Z",
    },
  },
};

export const WithCustomLink: Story = {
  args: {
    item: {
      kind: "chat",
      entityId: "c_2",
      title: "Design review",
      preview: "Working through the new spacing tokens.",
      updatedAt: "2024-01-13T10:00:00.000Z",
    },
    renderLink: ({ children, className, href }) => (
      <a href={href} className={className}>
        {children}
      </a>
    ),
  },
};

export const WithClickHandler: Story = {
  args: {
    item: {
      kind: "note",
      entityId: "n_2",
      title: "Release checklist",
      updatedAt: "2024-01-12T10:00:00.000Z",
    },
    onClick: () => {},
  },
};
