# Team Roles & Domain Ownership

DealNest Group founding team: 4 brothers.
**Imran** is the Senior Engineer and technical lead — final call on all architecture decisions.
Adnan, Brother 3, and Brother 4 are junior engineers owning their respective surfaces.

---

## Domain ownership matrix

| Domain | Files / Paths | Owner | Who can review PRs |
|---|---|---|---|
| Backend API | `packages/api/` | **Imran** | Any brother |
| Database schema & migrations | `packages/db/` | **Imran** | Imran only |
| Python agents | `packages/agents/` | **Imran** | Any brother |
| Infrastructure / CI | `.github/` | **Imran** | Imran only |
| Shared TypeScript types | `packages/types/` | **Imran** | Imran only |
| Web app | `apps/web/` | **Adnan** | Any brother |
| Shared UI components | `packages/ui/` | **Adnan** | Any brother |
| Mobile app | `apps/mobile/` | **Brother 3** | Any brother |
| Browser extension | `apps/extension/` | **Brother 4** | Any brother |
| Docs | `docs/`, `CLAUDE.md`, `CHANGES.md` | All brothers | Any brother |

---

## PR approval rules

| PR touches | Minimum approvals required |
|---|---|
| Your own domain only | 1 approval from any other brother |
| Another brother's domain | 1 approval from **that domain's owner** |
| `packages/db/migrations/` | **Imran must approve** |
| `packages/types/` | **Imran must approve** |
| `.github/` workflows | **Imran must approve** |
| `CLAUDE.md` | **Imran must approve** |
| Architecture change (any) | **Imran must approve + document in DECISIONS.md** |

CI must pass (lint + typecheck + tests) before any PR can be merged.

---

## How juniors should work with AI (Claude Code)

When you open a Claude Code session:

1. **Read `CHANGES.md` first** — the "Current State" table tells you what's done and what's broken.
2. **Read `CLAUDE.md`** — Claude Code loads this automatically, but you should know it too.
3. **Stay in your domain.** If a task requires touching another brother's domain, raise it in the team chat first.
4. **For anything in `packages/db/migrations/`** — write the migration and put it in a PR, do not run it in production. Imran reviews and runs it.
5. **For new npm packages** — check if the functionality exists in the stack (CLAUDE.md "What NOT to do" section). If unsure, ask Imran before installing.
6. **For new Python packages** — add to `requirements.txt` and note in the PR why the existing stack doesn't cover it.

---

## Decision authority

| Decision type | Who decides |
|---|---|
| New npm/pip dependency | Imran (for packages), domain owner for obvious additions |
| DB schema change | Imran |
| New environment variable | Imran (adds to GitHub Secrets and Vercel) |
| New GitHub Actions workflow | Imran |
| Breaking API change | Imran |
| UI/UX change in web app | Adnan (but Imran reviews if it touches data layer) |
| Mobile UX | Brother 3 |
| Extension behaviour | Brother 4 (Imran reviews anything touching signal capture) |
| Business / product priority | Adnan (CEO role) — but technical cost estimated by Imran |

---

## Escalation

If two brothers disagree on an implementation approach:
1. Either brother writes a short summary of both options (2–3 sentences each) in a PR comment.
2. Imran makes the call within 24 hours.
3. The decision is documented in `docs/DECISIONS.md` if it affects architecture.

There is no design-by-committee. Decisions get made and documented.

---

## Onboarding a new session (for AI and humans alike)

```
1. git pull origin develop
2. Read CHANGES.md → Current State table
3. Read your package's README (packages/agents/README.md etc.)
4. Check the Priority queue in CHANGES.md
5. Branch: git checkout -b feature/<area>/<short-description> origin/develop
6. Work → commit → PR to develop
7. Update CHANGES.md "Current State" table before requesting review
```
