---
name: newsboy-test-account
description: Sign into local Newsboy as its dedicated test user and verify authenticated browser or end-to-end flows. Use when testing Newsboy UI, persistence, history, or login behavior.
---

# Newsboy local test account

Use `test@lvh.me` whenever a local Newsboy test needs a signed-in player. Do not use a personal account, and do not send this test identity or its OTP to a production service.

## Browser sign-in

1. Confirm Newsboy and Hominem point to local development services (`https://newsboy.lvh.me` and `https://api.lvh.me`, or their local portless equivalents).
2. Start at Newsboy's own sign-in link and enter `test@lvh.me`.
3. Retrieve a fresh local code with `just otp test@lvh.me` from the Hominem repository. Never inspect the mailbox file directly.
4. Enter the six digits in the browser and verify the app returns to the requested Newsboy route with authenticated navigation visible.
5. Perform the requested test and verify persisted state through the app's history or result view when applicable.

The test account is persistent. Do not delete it as cleanup. Clean up only test data created by the current run when the test requires cleanup.

For service-level auth helpers and tests in Hominem, use the `hominem-auth-e2e` skill. Single-actor tests use the same `test@lvh.me` identity; multi-actor tests may use additional synthetic accounts when distinct identities are required.
