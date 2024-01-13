import React from "react";
import renderer from "react-test-renderer";
import { test, expect, vi } from "vitest";
import Account from ".";

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: vi.fn(() => ({
    loading: false,
    user: {
      name: "Test user",
      email: "test@user.com",
      picture: "https://avatar.com",
    },
  })),
  withAuthenticationRequired: vi.fn(),
}));

test("Account", () => {
  test("renders when loading = true", () => {
    const div = renderer.create(<Account />);
    expect(div.toJSON()).toMatchSnapshot();
  });
});
