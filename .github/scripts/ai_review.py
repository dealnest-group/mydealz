#!/usr/bin/env python3
"""
AI PR Reviewer — posts a Claude-powered code review comment on every PR.
Checks the diff against the rules in CLAUDE.md.

Usage:
    python ai_review.py <diff_file> <claude_md_file>
"""
import os
import sys

import anthropic
import requests

SYSTEM_PROMPT = """\
You are a senior code reviewer for MyDealz, an AI-native deals aggregator.
Review the PR diff against these project rules:

{claude_md}

Check for:
1. TypeScript: no `any`, no implicit returns, strict mode compliance
2. Imports: shared types from `packages/types` only, DB access via `packages/db` only
3. tRPC: every procedure must have a Zod input schema
4. Security: no PII in signals, no hardcoded secrets, RLS never disabled
5. Style: named exports only (except Next.js pages and Expo screens), no console.log
6. Python agents: stateless, structured JSON logging, --dry-run flag, LLM calls only via llm.py
7. No new npm packages that duplicate existing stack capabilities

Format your response exactly as:

## AI Review

### What looks good
- bullet points only

### Issues to fix
- `file:line` — description (or "None" if clean)

### Must fix before merge
- `file:line` — critical issue (or "None" if clean)

Be concise. Only flag real problems. Do not repeat things that are fine."""


def main() -> None:
    diff_path = sys.argv[1] if len(sys.argv) > 1 else "pr.diff"
    claude_md_path = sys.argv[2] if len(sys.argv) > 2 else "CLAUDE.md"

    try:
        with open(diff_path) as f:
            diff = f.read(12000)  # Cap at 12KB — roughly 300 changed lines
    except FileNotFoundError:
        print(f"Diff file not found: {diff_path}")
        sys.exit(0)

    if not diff.strip():
        print("Empty diff — nothing to review.")
        sys.exit(0)

    try:
        with open(claude_md_path) as f:
            claude_md = f.read(4000)
    except FileNotFoundError:
        claude_md = "(CLAUDE.md not found)"

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM_PROMPT.format(claude_md=claude_md),
        messages=[
            {
                "role": "user",
                "content": f"Review this PR diff:\n\n```diff\n{diff}\n```",
            }
        ],
    )

    review_body = message.content[0].text

    # Post to GitHub PR as a comment
    repo = os.environ["GITHUB_REPOSITORY"]
    pr_number = os.environ["PR_NUMBER"]
    token = os.environ["GITHUB_TOKEN"]

    resp = requests.post(
        f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        json={"body": review_body},
        timeout=15,
    )

    if resp.status_code == 201:
        print("Review posted.")
    else:
        print(f"Failed to post review: {resp.status_code}\n{resp.text}")
        sys.exit(1)


if __name__ == "__main__":
    main()
