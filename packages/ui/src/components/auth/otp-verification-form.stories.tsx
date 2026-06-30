import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";

import { OtpVerificationForm } from "./otp-verification-form";

const meta = {
  title: "Patterns/Auth/OtpVerificationForm",
  component: OtpVerificationForm,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof OtpVerificationForm>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledOtpVerificationForm(args: ComponentProps<typeof OtpVerificationForm>) {
  const [otp, setOtp] = useState(args.otp);

  return <OtpVerificationForm {...args} otp={otp} onOtpChange={setOtp} />;
}

export const Default: Story = {
  args: {
    email: "studio@ponti.so",
    otp: "",
    onOtpChange: () => {},
    onSubmit: async () => {},
    onResend: async () => {},
    onChangeEmail: () => {},
  },
  render: (args) => (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="w-full">
        <ControlledOtpVerificationForm {...args} />
      </div>
    </div>
  ),
};

export const WithError: Story = {
  args: {
    email: "studio@ponti.so",
    otp: "12",
    error: "Invalid code. Please try again.",
    onOtpChange: () => {},
    onSubmit: async () => {},
    onResend: async () => {},
    onChangeEmail: () => {},
  },
  render: (args) => (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="w-full">
        <ControlledOtpVerificationForm {...args} />
      </div>
    </div>
  ),
};

export const Resending: Story = {
  args: {
    email: "studio@ponti.so",
    otp: "123456",
    isResending: true,
    onOtpChange: () => {},
    onSubmit: async () => {},
    onResend: async () => {},
    onChangeEmail: () => {},
  },
  render: (args) => (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="w-full">
        <ControlledOtpVerificationForm {...args} />
      </div>
    </div>
  ),
};
