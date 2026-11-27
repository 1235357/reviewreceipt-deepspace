# ReviewReceipt

Independent review and handoff for AI-generated work. The single public product entry is https://scopecheck-zye.app.space/; it includes an interactive sample and a no-account custom comparison. The signed-in review workspace at /blind is the authenticated continuation of the same product.

## Workflow

Freeze a question, criteria, and two candidate responses. In the real collaborative workspace, assign two registered teammates. Each receives masked answers in opposite order and locks a judgment with a reason. Participants see only progress before both votes are committed. Then reveal mapped choices and reasons, and download a review receipt. Agreement is a preference signal, not proof of factual correctness. The no-account comparison runs locally on one device and does not verify independent identities.

## Implementation

React, TypeScript, Vite, Hono and the DeepSpace SDK. Auth establishes identity; server actions enforce membership and immutable ballots. Durable records persist rooms, ballots, and opaque progress receipts. WebSocket subscriptions surface progress, and the server maps labels to canonical responses. A missing receipt can be resynchronized without altering a locked ballot. No model API or paid external integration is required: this app compares user-provided candidate outputs.

## Run and verify

```sh
npm ci
npm run validate
npm run build
```

Use an appropriately authorized DeepSpace development environment and test identities for live tests. No confidential school, employer, or customer data is included. The applicant's own verification is distinct from assistant-run test evidence. Full production multi-account collaboration remains unverified.

Official docs: https://docs.deep.space/
