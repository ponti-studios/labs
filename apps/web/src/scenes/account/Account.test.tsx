import { screen } from "@testing-library/react";
import React from "react";
import { test, expect, describe } from "vitest";
import { renderWithProviders } from "src/test/utils";
import { useAuth } from "src/services/store";

import Account from "./Account";

describe("Account", () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        name: "Test user",
        email: "test-user@email.com",
        avatar: "https://avatar.com",
        createdAt: "2021-01-01T00:00:00.000Z",
      },
    });
  });

  test("renders when loading = true", () => {
    renderWithProviders(<Account />);
    expect(screen.getByText("Test user")).toBeInTheDocument();
  });
});
