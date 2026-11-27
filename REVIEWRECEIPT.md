# ReviewReceipt — independent review and handoff

A small shared workflow for teams comparing two AI-generated artifacts before choosing what to adopt. The coordinator freezes the question and criteria, assigns two colleagues, and supplies two labeled responses. Each reviewer gets masked responses in opposite order. Only a sealed receipt count is shared until both have committed. The result maps presentation labels back to the original identity and exports a human-readable review receipt with the frozen criteria and independent reasoning.

## Try

- /blind-demo: authored, single-device sample. No persisted data or real model call.
- /blind: signed-in collaborative workspace. Two additional registered users are needed; sign in before the coordinator selects them. Use public or non-sensitive examples.
- / and /workspace: existing ScopeCheck functionality, retained unchanged apart from one new navigation link.

## Design and tradeoffs

Private room and ballot collections cannot be directly read or written by clients. Server actions check the caller and membership and use immutable unique ballot keys. Shared receipts contain progress only. A receipt is a distinct record, not a cross-collection transaction; a reviewer can recover a lost receipt without changing the locked vote. Two ties are inconclusive, not evidence for either answer. Agreement indicates preference, not correctness. Answer text itself can reveal authorship, so the coordinator must remove obvious model identifiers.

The app uses DeepSpace auth, durable records, server-side membership checks and realtime receipt subscriptions. It does not add owner-billed AI calls, payments, or external data APIs.

## Actual verification by the coding assistant (2026-11-27 UTC)

- TypeScript and 37 unit tests passed on the additive release candidate; production build and static prerender passed.
- Official test accounts: four isolated identities. A real local worker test passed with authenticated HTTP and WebSockets: registered user discovery, masked order, first ballot sealed, owner receipt notification, unassigned observer excluded, reconnect snapshot, second ballot and mapped reveal. This is an actual worker test, not a browser UI test.
- Browser E2E attempted: failed before the first UI action because the installed Chromium launcher lacks its binary. Do not claim UI E2E, production cross-account flow, or applicant-personal verification from this result.
- Current limitations: only two assigned reviewers; room list discovery is refreshed manually; no external user adoption study; no factual verification of reviewer judgments.

The earlier release remains accessible through the original routes. No customer materials are used.
