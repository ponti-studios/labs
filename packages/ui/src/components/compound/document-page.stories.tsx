import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { DocumentPage, type DocumentPageProps, InfoGrid } from "./document-page";

const meta: Meta<typeof DocumentPage> = {
  component: DocumentPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// DocumentPage stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    homeLabel: "Acme",
    title: "Privacy Policy",
    description:
      "This Privacy Policy describes how Acme Inc. collects, uses, and shares information about you when you use our services. Please read it carefully.",
  },
  render: (args) => (
    <DocumentPage {...(args as DocumentPageProps)}>
      <div className="mt-12 space-y-10">
        <section>
          <h2 className="text-2xl font-bold tracking-tight">Information We Collect</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            We collect information you provide directly to us, such as when you create an account,
            make a purchase, or contact us for support. This may include your name, email address,
            and payment details. We also collect certain information automatically when you use our
            services, such as your IP address and browsing activity on our platform.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold tracking-tight">How We Use Your Information</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            We use the information we collect to provide, maintain, and improve our services,
            process transactions, and send you related information including purchase confirmations
            and invoices. We may also use your information to respond to your comments and
            questions, and to send you technical notices and support messages.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold tracking-tight">Data Retention</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            We retain personal information we collect from you where we have an ongoing legitimate
            business need to do so. When we have no ongoing legitimate business need to process your
            personal information, we will either delete or anonymise it.
          </p>
        </section>
      </div>
    </DocumentPage>
  ),
};

export const WithNavLink: Story = {
  args: {
    homeLabel: "Acme",
    title: "Privacy Policy",
    description:
      "This Privacy Policy describes how Acme Inc. collects, uses, and shares information about you when you use our services. Please read it carefully.",
    navLink: { label: "Contact us", href: "/contact" },
  },
  render: (args) => (
    <DocumentPage {...(args as DocumentPageProps)}>
      <div className="mt-12 space-y-10">
        <section>
          <h2 className="text-2xl font-bold tracking-tight">Information We Collect</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            We collect information you provide directly to us, such as when you create an account,
            make a purchase, or contact us for support. This may include your name, email address,
            and payment details.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-bold tracking-tight">How We Use Your Information</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            We use the information we collect to provide, maintain, and improve our services,
            process transactions, and send you related information including purchase confirmations
            and service updates.
          </p>
        </section>
      </div>
    </DocumentPage>
  ),
};

// ---------------------------------------------------------------------------
// InfoGrid story
// ---------------------------------------------------------------------------

export const InfoGridExample: Story = {
  name: "InfoGrid",
  render: () => (
    <div style={{ padding: "2rem 1.5rem", maxWidth: 900, margin: "0 auto" }}>
      <InfoGrid
        items={[
          {
            id: "data-collection",
            title: "Data Collection",
            description:
              "We collect only the data necessary to provide our services, including account information and usage patterns.",
          },
          {
            id: "data-usage",
            title: "Data Usage",
            description:
              "Your data is used to improve your experience, power product features, and deliver relevant communications.",
          },
          {
            id: "data-sharing",
            title: "Data Sharing",
            description:
              "We do not sell your personal data. We may share it with trusted sub-processors solely to operate our service.",
          },
          {
            id: "your-rights",
            title: "Your Rights",
            description:
              "You can request access to, correction of, or deletion of your personal data at any time by contacting our team.",
          },
        ]}
      />
    </div>
  ),
};
