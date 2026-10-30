# Validation

## Offline verification

`npm test` runs eleven frontend reasoning/integrity tests. `npm run test:contract` runs thirteen offline contract tests. The JavaScript and Python suites each enumerate all 4096 directed four-node frameworks without self-attacks and compare the implementation against a separate fixed-point definition. They also cover reinstatement, mutual attack, downstream uncertainty, digest changes, invented quotes, omitted findings, owner-bound submissions, stale inputs and independent validator disagreement.

Contract tests use an explicitly mocked GenLayer host and model responses. They test protocol behavior and failure atomicity, not live model quality or network consensus. Successful offline tests are not presented as on-chain evidence.

## Network verification

Observed deployments and transactions are saved under `evidence/`. The configured deployment is in `public/deployment.json`. Network results are documented only after their real receipts and matching state have been read.


## Observed Stable Studionet run — 2026-10-30

Contract: `0xFbAc1b283b1Ae7f311f8A79b8AcdcD95750bd462`.

Discussion: `0x622f6ff6cbc8136db351d5eaafad8ea1052fbac5:gallery-mvuq09hz`.

The application completed deployment, room creation, two independently signed voice bundles, permissionless mapping by a third address, finalized-success checks, exact source verification, receipt-to-intent binding, locally recomputed results, and both JSON exports. All transactions transferred zero GEN. The observed semantic findings are UNDERCUT, REBUTTAL and NOT_ATTACK. Final labels are A1 IN, A2 IN, B1 OUT, B2 IN, derived in two rounds.

Input SHA-256: `3021fbebf4860a5c6baee156dcadb27e426ee54dcb5750406c1e93046ab6bf54`.

Result SHA-256: `37f7afe82a86517656421ac0f6482d2dcdf9e53707e9640e83d2c4c868132b70`.

[Observed transaction index](../evidence/transaction-index.json), [verified discussion](../evidence/verified-discussion.json), [deployment receipt](../evidence/deployment-receipt.json), [mapping receipt and journal](../evidence/execution-journal.json).

| Operation | Finalized transaction |
| --- | --- |
| Deploy | [0xa2d8b389…](https://explorer-studio.genlayer.com/tx/0xa2d8b38975a3320e3fb355f5be8aa6809f509b795fae5ffee113a1f1f2b0543f) |
| Open completed discussion | [0x0be3c572…](https://explorer-studio.genlayer.com/tx/0x0be3c572d1212b1a05d7ca3d72536aa634b77ae4fa5408e1bcdab326ec8bfeb9) |
| Sign voice A | [0xc6970a6a…](https://explorer-studio.genlayer.com/tx/0xc6970a6ad58b85f448cb5016168e60ef9f4aa773f839a1f5b1ff54ce8aeb20c1) |
| Sign voice B | [0x63460fb6…](https://explorer-studio.genlayer.com/tx/0x63460fb6fc10970f2e835f83e6d85d677c0d1b3ca8fc2b1ea9961150193ad478) |
| Map discussion | [0xde255b1c…](https://explorer-studio.genlayer.com/tx/0xde255b1cee541b7b597114c5317250d18a1a74d710de4b1ca7dfe6940673f28e) |

An additional early room creation was finalized but not completed; its transaction is retained in the index. Compatibility regressions for SDK Map calldata decoding and browser-independent SHA-256 calculation were corrected before the completed run. The contract source was unchanged.

The test wallets are distinct addresses controlled by the same tester. Live tests establish the submission, consensus and state-readback path for this example; they do not establish independence of real organizations. REVIEW, circular attacks, authorization failures and malicious-input handling are covered offline. Those branches are not claimed as separate live network runs.

## Browser checks

Desktop and a 375 CSS pixel mobile viewport render the full application without horizontal page overflow. Mobile checks exercised challenge removal (A1 becomes OUT), mutual attack (A1 remains UNDECIDED), and Chinese language switching. Local browser WebGL was unavailable; the geometric Canvas fallback rendered the moving sculpture. The WebGL implementation built successfully but its GPU path was not visually exercised in that environment. An injected-wallet signature/rejection flow was not exercised live; temporary Studio signers were used.
