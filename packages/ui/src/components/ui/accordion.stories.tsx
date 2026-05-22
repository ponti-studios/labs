import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";

const meta: Meta = {
  component: Accordion,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["single", "multiple"],
    },
    collapsible: { control: "boolean" },
  },
};

export default meta;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Story = StoryObj<any>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-xl">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is your refund policy?</AccordionTrigger>
        <AccordionContent>
          We offer a 30-day money-back guarantee on all purchases. If you are not satisfied, contact
          support and we will issue a full refund.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
        <AccordionContent>
          You can cancel your subscription at any time from the billing settings page. Your access
          will remain active until the end of the billing period.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Do you offer enterprise plans?</AccordionTrigger>
        <AccordionContent>
          Yes, we offer custom enterprise plans tailored to your team's needs. Reach out to our
          sales team to learn more.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithIndex: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-xl">
      <AccordionItem value="item-1">
        <AccordionTrigger index={0}>What is your refund policy?</AccordionTrigger>
        <AccordionContent>
          We offer a 30-day money-back guarantee on all purchases. If you are not satisfied, contact
          support and we will issue a full refund.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger index={1}>How do I cancel my subscription?</AccordionTrigger>
        <AccordionContent>
          You can cancel your subscription at any time from the billing settings page. Your access
          will remain active until the end of the billing period.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger index={2}>Do you offer enterprise plans?</AccordionTrigger>
        <AccordionContent>
          Yes, we offer custom enterprise plans tailored to your team's needs. Reach out to our
          sales team to learn more.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-xl">
      <AccordionItem value="item-1">
        <AccordionTrigger
          badge={
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              New
            </span>
          }
        >
          What is your refund policy?
        </AccordionTrigger>
        <AccordionContent>
          We offer a 30-day money-back guarantee on all purchases. If you are not satisfied, contact
          support and we will issue a full refund.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
        <AccordionContent>
          You can cancel your subscription at any time from the billing settings page. Your access
          will remain active until the end of the billing period.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger
          badge={
            <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
              Updated
            </span>
          }
        >
          Do you offer enterprise plans?
        </AccordionTrigger>
        <AccordionContent>
          Yes, we offer custom enterprise plans tailored to your team's needs. Reach out to our
          sales team to learn more.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const WithAside: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-xl">
      <AccordionItem value="item-1">
        <AccordionTrigger aside={<span className="text-xs text-muted-foreground">5 min read</span>}>
          What is your refund policy?
        </AccordionTrigger>
        <AccordionContent>
          We offer a 30-day money-back guarantee on all purchases. If you are not satisfied, contact
          support and we will issue a full refund.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger aside={<span className="text-xs text-muted-foreground">2 min read</span>}>
          How do I cancel my subscription?
        </AccordionTrigger>
        <AccordionContent>
          You can cancel your subscription at any time from the billing settings page. Your access
          will remain active until the end of the billing period.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger aside={<span className="text-xs text-muted-foreground">8 min read</span>}>
          Do you offer enterprise plans?
        </AccordionTrigger>
        <AccordionContent>
          Yes, we offer custom enterprise plans tailored to your team's needs. Reach out to our
          sales team to learn more.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-xl">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is your refund policy?</AccordionTrigger>
        <AccordionContent>
          We offer a 30-day money-back guarantee on all purchases. If you are not satisfied, contact
          support and we will issue a full refund.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
        <AccordionContent>
          You can cancel your subscription at any time from the billing settings page. Your access
          will remain active until the end of the billing period.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Do you offer enterprise plans?</AccordionTrigger>
        <AccordionContent>
          Yes, we offer custom enterprise plans tailored to your team's needs. Reach out to our
          sales team to learn more.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const OpenByDefault: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-2" className="w-full max-w-xl">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is your refund policy?</AccordionTrigger>
        <AccordionContent>
          We offer a 30-day money-back guarantee on all purchases. If you are not satisfied, contact
          support and we will issue a full refund.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
        <AccordionContent>
          You can cancel your subscription at any time from the billing settings page. Your access
          will remain active until the end of the billing period.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Do you offer enterprise plans?</AccordionTrigger>
        <AccordionContent>
          Yes, we offer custom enterprise plans tailored to your team's needs. Reach out to our
          sales team to learn more.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
