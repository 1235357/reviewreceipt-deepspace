# ReviewReceipt

**Independent review and handoff for AI-generated work.**

[Try the public demo — no sign-in required](https://scopecheck-zye.app.space/blind-demo) · [Open the collaborative workspace](https://scopecheck-zye.app.space/blind)

Small teams often need to compare two AI-generated deliverables without influencing each other's evaluation. ReviewReceipt freezes the question and rubric, masks the two answers in opposite order for two assigned reviewers, locks each judgment, and reveals the matched identities only after both submit. The team can download a readable review receipt and JSON result. Agreement is a preference signal, not proof of factual correctness.

## Product flow

1. Try the no-account sample or paste your own two responses and rubric into local guest mode. Both modes produce a clearly labeled downloadable receipt without a sign-in. Local guest mode does not verify independent identities.
2. For real collaboration, sign in to the workspace. Ask two teammates to join the workspace and sign in so the coordinator can select them.
3. Create a frozen review with a question, criteria, two candidate responses and their identities. Use non-sensitive content.
4. Assigned reviewers submit independently. The group sees a count, not peer decisions, while the review is sealed.
5. Reveal the results and export a receipt for the next decision.

## Technical design

React, TypeScript, Vite, Hono and the DeepSpace SDK. Authentication establishes identity; server actions enforce participant-level access and immutable votes. Durable records persist rooms, ballots and opaque shared receipts. WebSocket subscriptions surface progress; the server maps labels to canonical responses. A missing receipt can be resynchronized without changing a locked ballot.

This is a deliberately focused product: no model API call or paid integration is required to review an existing response. DeepSpace Auth, RecordRoom data and permissions, Server Actions, and live subscriptions are used for the core workflow. The test avoids claiming that consensus means correctness.

## Verification (2026-11-27 UTC)

- Type checking, 41 unit tests and production build passed.
- Four real DeepSpace test identities passed a local worker HTTP/WebSocket test covering registration, participant discovery, different answer order, sealed votes, live receipt, unassigned observer visibility, reconnect snapshot and final reveal.
- The public demo was operated in a real browser after deployment: both votes and reasons were entered, the expected answer mapping was revealed, the receipt was downloaded, and its text was checked. The authenticated workspace rendered and connected. The latest no-account custom guest workflow was also exercised with a new authored task, two candidate responses, two reasons, correct reveal, and actual receipt download/readback.
- Full browser automation of multiple accounts could not start because the command-line environment lacked its Chromium binary. A separately authorized production HTTP/WebSocket test was blocked by DNS before login. These are not claimed as passed.
- No external user adoption study has been performed.

## Source and deployment

The deployment is **DeepSpace-source managed**; this public repository is a review copy. [Exact runtime snapshot](https://github.com/1235357/reviewreceipt-deepspace/commit/bc5f60c834a2607f3e81e664ab0272196ee7fb0a) matches the deployed source tree `da171468ff199e0fee047c9b893fe0d2570fe8e3` (DeepSpace commit `70742a2ba02bc130616c09cd4f0e21592af10750`, release `rel_01M8DBY6F0NVVN0XEWH8WECZV7`). This README is a documentation-only follow-up. The existing ScopeCheck routes are retained because the account has one active app slot; ReviewReceipt is accessed directly at the links above.

```sh
npm ci
npm run validate
npm run build
```

For local runtime tests, use your own appropriately authorized DeepSpace development environment and test identities. Do not attempt to deploy over the existing assessment app or copy secrets. See [implementation notes](REVIEWRECEIPT.md) and the `tests/blind-runtime.spec.ts` source for the local test contract.

No client, employer, or confidential research data is included. The build is AI-assisted; the applicant's personal verification is separate from the assistant's test evidence.
