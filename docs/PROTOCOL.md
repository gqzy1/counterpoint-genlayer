# Protocol

## Shared inputs

A discussion is identified by `creator-address:slug`. Its question, 2–4 invited wallets, and seat order are immutable. Each wallet supplies exactly two titled arguments (slots A1/A2, B1/B2, and so on) and at most four proposed directed challenges. A challenge contains its source, target and explanatory basis. Only the source argument's wallet may propose it. Each wallet signs its whole bundle once; identical resubmission is idempotent and different resubmission fails.

All inputs are public. Text is trimmed at its outer boundary on ingestion; interior text is preserved. No external data is fetched because the product is an assessment of declared argument structure, not factual authentication.

## Consensus boundary

The leader assesses the complete ordered list of proposed challenges against the original source and target texts, question and declared basis. The basis cannot create an attack absent from the arguments themselves.

- REBUTTAL: the source directly contradicts the target conclusion under the same scope and conditions.
- UNDERCUT: the source challenges an actual premise or inference used to establish that target conclusion.
- NOT_ATTACK: related subject matter or a different consideration that does not establish either relation.
- UNCLEAR: the relation is genuinely ambiguous in the submitted wording.

REBUTTAL takes priority if both types apply. Stipulated external premises are not verified. Each row contains exact source/target text quotations and a contextual reason. The parser rejects extra/missing fields, omitted rows, duplicate JSON keys, invalid labels, invented quotations, oversized outputs and malformed results.

The validator executes the entire semantic task independently from the original inputs. It must match the leader on **every ordered kind**, including NOT_ATTACK and UNCLEAR. It does not merely check output shape, the final label set, or the leader's explanation. Quotation wording and reasons may differ between model outputs; stored prose is the accepted leader's context, not verbatim text agreed by every validator. Quotation substring checks establish textual grounding, not semantic correctness by themselves.

Errors and validator disagreement abort the call without changing discussion state. There is no automatic semantic retry or appeal in the application. Zero proposed challenges bypasses the model boundary; the deterministic result is that all arguments are unchallenged.

## Grounded labelling

Only REBUTTAL and UNDERCUT become attack edges. If any finding is UNCLEAR, the whole record is REVIEW with `semantics: null`; accepted partial edges are displayed only as findings and no complete labelling is published.

Otherwise all arguments start UNDECIDED. Each round marks an undecided argument IN if every attacker is already OUT (including arguments with no attackers). It then marks an undecided argument OUT if at least one attacker is IN. Repeat until nothing changes. Remaining arguments stay UNDECIDED. This computes Dung's least grounded labelling; there is no popularity weighting or index-based choice among disputed arguments.

The result stores propagation rounds, all attackers, a canonical IN defeating witness for each OUT node, and the nontrivial strongly connected components in the undecided subgraph. Downstream undecided arguments need not themselves belong to a cycle. This is a finite framework of at most eight arguments and sixteen proposed links.

## Lifecycle and integrity

`COLLECTING → READY → MAPPED | REVIEW`

All invited voices are required before READY. No creator override, removal or replacement exists. `input_digest` is SHA-256 of canonical JSON for protocol, discussion ID, question, members and signed voices. `map_room` requires that exact digest. A terminal call is idempotent. `result_digest` commits protocol, ID, input digest, status, findings, accepted edges and full semantics. Digests provide byte integrity; they are not substitutes for semantic validation.

The browser independently reconstructs arguments from signed bundles, checks both digests and quote grounding, rebuilds the accepted graph, and recomputes every deterministic output before displaying a completed result as verified.

| Method | Arguments | Access |
| --- | --- | --- |
| `open_room` | slug, question, members_json | Creator must be first distinct listed wallet |
| `submit_voice` | room_id, voice_json | Invited wallet, own source slots, one immutable bundle |
| `map_room` | room_id, expected_input_digest | Permissionless after every voice has signed |
| `get_room` | room_id | Public full JSON snapshot |
| `get_protocol` | none | Public protocol and bounds |

## Operational boundaries

Stable Studionet only, chain 61999, official RPC `https://studio.genlayer.com/api`. Source verification compares exact deployed code bytes to the included contract's SHA-256. Writes require zero gas price and transfer zero value. They use `leaderOnly: false` and at most three network consensus rotations. A network rotation is not an automatic second application transaction.

The frontend saves the public intended method, sender, recipient, arguments and returned hash before tracking. It checks FINALIZED, successful GenVM execution, MAJORITY_AGREE, exact receipt intent, and matching `latest-final` state readback. A transient read error retains the pending hash for recheck. A rejected signature sends nothing. A submission error without a hash remains uncertain and is never automatically resent. Temporary private keys are not saved or exported.
