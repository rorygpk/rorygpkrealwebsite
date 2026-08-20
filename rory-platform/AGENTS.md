# AI Coding Agent Rules

An AI coding agent may work only through a Git branch and Pull Request.

- Read existing code before editing.
- Never read, print, commit, rotate, or modify secrets.
- Never force-push or directly edit production.
- Never delete D1 data, R2 objects, users, or administrators.
- Never change authentication, OAuth, permissions, encryption, mail routing, or migrations without Owner review.
- Run tests and checks before opening a Pull Request.
- High-risk automation may mark, rate-limit, notify, or escalate. It may not permanently ban or delete without human approval.
- Deploy through preview first, then approved merge.
