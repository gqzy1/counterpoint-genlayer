# COUNTERPOINT

**Room for a second thought.**

A shared reasoning atelier for small groups. Participants sign their own arguments and proposed challenges. GenLayer independently assesses each challenge; deterministic grounded semantics computes which arguments stand, are defeated, or remain undecided.

[Open the application](https://gqzy1.github.io/counterpoint-genlayer/) · [How to use it](docs/USE.md) · [Protocol](docs/PROTOCOL.md) · [Validation](docs/VALIDATION.md)

**Verified example:** MAPPED · 3 IN / 1 OUT · two reasoning rounds · five finalized lifecycle transactions. [Inspect the evidence](docs/VALIDATION.md).

![COUNTERPOINT desktop interface](media/desktop.jpg)

## Why it exists

A popular answer is not necessarily a defended answer. A discussion may contain a rebuttal, a challenge to that rebuttal, and a circular dispute with no justified starting point. COUNTERPOINT preserves those distinctions in a shared, inspectable record. It is useful for public product decisions, exhibition planning, and small community design discussions.

The application is one complete GenLayer Project. Its contract source is included in this repository; it is not a second Intelligent Contracts submission.

## Try it

1. **Playground** offers three explicitly authored offline examples: a reinstated argument, an unresolved mutual attack, and a relevant thought that does not constitute a rebuttal. Toggle challenges, inspect a node, and replay the derivation. No AI call or transaction occurs in this mode.
2. **On GenLayer → Read published discussion** reads the configured finalized example without a wallet. The browser verifies deployed source bytes, signed-input and result digests, exact quotes, accepted edges, and the full deterministic derivation.
3. For your own discussion, connect an injected EIP-1193 wallet, or use temporary free Studio participants. Open a question with 2–4 distinct wallets; the creator is seat A.
4. Each invited wallet signs two arguments and up to four directed challenges. It can only propose attacks originating from its own arguments. Contributions are immutable.
5. Once all voices are signed, any wallet can **Map with GenLayer**. Every proposed challenge receives REBUTTAL, UNDERCUT, NOT_ATTACK or UNCLEAR through independent validator comparison. UNCLEAR produces REVIEW and no complete argument labelling.
6. A completed MAPPED record contains every accepted edge, IN/OUT/UNDECIDED label, propagation round, defeating witness, unresolved cycle, and SHA-256 commitment. Export the record and transaction journal separately.

The public example is a fictional exhibition discussion, not verified venue information. Test participants have distinct signing addresses controlled by one tester; they do not represent independent organizations.

## Design

A warm paper surface, expressive editorial type, vermilion accents and a moving metal counterbalance give disagreement a tangible form. The sculpture uses WebGL where available and a geometric Canvas renderer otherwise. The argument graph remains an exact, keyboard-accessible SVG. The interface supports English/Chinese, narrow screens, reduced motion and quiet procedural ambient sound, enabled after the first permitted interaction with an explicit mute control.

## Run

Node.js 22 or newer, Python 3.10 or newer for the offline contract tests.

```sh
npm ci
npm run dev
npm test
npm run test:contract
npm run build
```

Production output is `dist/`. Relative asset paths support GitHub Pages repository subpaths. Fonts are bundled. No application backend, paid model API, server-held wallet key, database, telemetry, or account registration is required.

## Scope

The contract evaluates **argument structure under the submitted premises**. It does not authenticate external facts, search for omitted arguments, infer unproposed links, rank people, or determine the truth of the discussion topic. IN means justified within this bounded framework; it does not mean factually true. An unchallenged false premise can still be IN. Premise verification remains a separate human task.

Only the submitted attack graph is represented. Support links, weighted preferences, financial stakes, appeals and editable rounds are outside this version. Corrected input requires a new discussion ID. Any invited member can prevent completion by not signing; the creator cannot exclude that member or force a result.

Temporary signing keys live only in the current tab's memory. Reloading loses them. Never fund a temporary participant. Only public discussion text should be submitted; the contract retains it permanently.

## Implementation

| Path | Purpose |
| --- | --- |
| `contracts/counterpoint.py` | Complete GenLayer contract and independent semantic validator |
| `src/reasoning.js` | Independent browser verifier and grounded labelling |
| `src/chain.js` | Wallets, source identity, zero-value writes, finality, intent binding and readback |
| `src/main.js`, `src/style.css` | Bilingual application and interactive argument desk |
| `src/sculpture.js`, `src/audio.js` | Procedural visual and ambient composition |
| `tests/`, `contract-tests/` | Fixed-point equivalence, integrity and authorization tests |
| `public/deployment.json`, `evidence/` | Deployment identity and observed network results |

MIT licensed. Fonts retain their bundled SIL Open Font Licenses. Grounded semantics follows [P. M. Dung's argumentation framework](https://www.cs.ait.ac.th/~dung/Site/Publications_files/ijcai93.pdf).
