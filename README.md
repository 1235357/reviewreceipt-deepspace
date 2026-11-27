# ReviewReceipt

**Independent review and handoff for AI-generated work.**

[Try the public demo — no sign-in required](https://scopecheck-zye.app.space/) · [Open the collaborative workspace](https://scopecheck-zye.app.space/blind)

Small teams often need to compare two AI-generated deliverables without influencing each other's evaluation. ReviewReceipt freezes the question and rubric, masks the two answers in opposite order for two assigned reviewers, locks each judgment, and reveals the matched identities only after both submit. The team can download a readable review receipt and JSON result. Agreement is a preference signal, not proof of factual correctness.

## Product flow

1. Try the no-account sample or paste your own two responses and rubric into local guest mode. Both modes produce a clearly labeled downloadable receipt without a sign-in. Local guest mode does not verify independent identities.
2. For real collaboration, sign in to the workspace. Ask two teammates to join the workspace and sign in so the coordinator can select them.
3. Create a frozen review with a question, criteria, two candidate responses and their identities. Use non-sensitive content.
4. Assigned reviewers submit independently. The group sees a count, not peer decisions, while the review is sealed.
5. Reveal the results and export a receipt for the next decision.

## Technical design

React, TypeScript, Vite, Hono and the DeepSpace SDK. Authentication establishes identity; server actions enforce participant-level access and immutable votes. Durable records persist rooms, ballots, and opaque shared receipts. WebSocket subscriptions surface progress; the server maps labels to canonical responses. A missing receipt can be resynchronized without changing a locked ballot.

This is a deliberately focused product: no model API call or paid integration is required to review an existing response. DeepSpace Auth, RecordRoom data and permissions, Server Actions, and live subscriptions are used for the core workflow. The test avoids claiming that consensus means correctness.

## Verification (2026-11-27 UTC)

- Type checking, 46 unit tests and production build passed.
- Four real DeepSpace test identities passed a local worker HTTP/WebSocket test covering registration, participant discovery, different answer order, sealed votes, live receipt, unassigned observer visibility, reconnect snapshot and final reveal.
- The public demo was operated in a real browser after deployment: both votes and reasons were entered, the expected answer mapping was revealed, the receipt was downloaded, and its text was checked. The authenticated workspace rendered and connected. The latest no-account custom guest workflow was also exercised with a new authored task, two candidate responses, two reasons, correct reveal, and actual receipt download/readback.
- Release #6 was verified in the cloud browser: public landing, own-answer entry, opposite-order sample voting/reveal, and the redesigned signed-in home rendered successfully.
- Release #7: in the cloud browser, the signed-in home links directly to custom guest comparison, which was filled with new authored inputs; two local slots voted using opposite labels, and the receipt displayed both actual reasons and the same candidate. Focus moved to each review heading and final receipt after submission. Reviewed Google's Modern Web Guidance on native controls, accessibility and required-field feedback; this is targeted adoption, not a complete accessibility audit.
- Release #8: the signed-in shared workspace was verified in the cloud browser, from connected state through the invitation step, copy-link confirmation, and protection against refreshing while a draft has unsaved text. The test did not send invitations or create a production review room. The revised native labeled fields are grouped by task, candidate responses and reviewer assignment; actual multi-user production remains unverified.
- Release #9: technical recommendation, AI answer and code review starter templates fill empty fields only. Three unit tests and the actual guest browser interaction verified existing questions and candidates are preserved. The CLI confirmed the edge but could not confirm the data plane; the live signed-in browser then showed Connected, rendered the new templates and completed the actual room-list refresh. This does not establish a complete production multi-user flow.
- Release #10: real cloud browser navigation to /home displayed the branded loading state and automatically entered the signed-in /blind workspace. The light navigation matched the public landing; selecting Public demo returned to the public no-account comparison. The CLI confirmed edge and data plane. Signed-out home behavior and full multi-account collaboration were not reverified in a browser.
- Release #11: the assistant reviewed 550 words of public copy in Grammarly (initial 94%, seven suggestions), applied six UI wording corrections and one documentation punctuation correction, and confirmed the new copy and template interaction in the live browser. Edge and data plane were confirmed by the CLI. These are editorial changes, not a new multi-user collaboration test.
- Full browser automation of multiple accounts could not start because the command-line environment lacked its Chromium binary. A separately authorized production HTTP/WebSocket test was blocked by DNS before login. These are not claimed as passed.
- No external user adoption study has been performed.

## Source and deployment

The deployment is **DeepSpace-source managed**; this public repository is a review copy. [Exact runtime snapshot](https://github.com/1235357/reviewreceipt-deepspace/commit/1d4322c0a5aba2d8920c95878722baedbc53fdc9) matches the deployed source tree `8ad8d07c1ee0a9f11048b6d7ddf49f2e71042be1` (DeepSpace commit `54f44d41423e37f600c290733e34993230685133`, release `rel_01M8DGMWC2BY0DXY4G0NV89FPJ`). This README is a documentation-only follow-up. The public landing and signed-in home are now ReviewReceipt; the previous ScopeCheck experience is preserved at `/scopecheck` and its existing data is retained. The account has one active app slot.

```sh
npm ci
npm run validate
npm run build
```

For local runtime tests, use your own appropriately authorized DeepSpace development environment and test identities. Do not attempt to deploy over the existing assessment app or copy secrets. See [implementation notes](REVIEWRECEIPT.md) and the `tests/blind-runtime.spec.ts` source for the local test contract.

No client, employer, or confidential research data is included. The build is AI-assisted; the applicant's personal verification is separate from the assistant's test evidence.
