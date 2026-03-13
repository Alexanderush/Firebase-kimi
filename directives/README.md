# Directives

This folder contains **SOPs (Standard Operating Procedures)** written in Markdown.

Each directive defines:
- **Goal** — What this procedure accomplishes
- **Inputs** — What data/context is needed
- **Tools/Scripts** — Which execution scripts to call (from `execution/`)
- **Outputs** — Expected deliverables
- **Edge Cases** — Known failure modes and how to handle them

## Creating a New Directive

Use this template:

```markdown
# [Directive Name]

## Goal
What this directive accomplishes.

## Inputs
- Input 1
- Input 2

## Procedure
1. Step 1 — call `execution/script_name.py` with [args]
2. Step 2 — ...

## Outputs
- Output 1

## Edge Cases & Learnings
- Known issue: [description] → Solution: [fix]
```

## Principles
- Directives are **living documents** — update them as you learn
- Write them like instructions for a mid-level employee
- Never delete a directive without asking the user first
