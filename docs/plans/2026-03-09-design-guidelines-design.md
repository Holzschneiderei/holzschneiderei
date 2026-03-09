# Design Guidelines — Design Document

**Date:** 2026-03-09
**Status:** Approved

## Problem

The Holzschneiderei configurator grew fast and has an implicit design language — tokens, components, spacing, accessibility patterns — but nothing written down. New code (human or AI-generated) risks drifting from established conventions.

## Decision

Create a single `SKILL.md` file at `.agents/skills/web-design-guidelines/` that serves dual purpose:

1. **Agent skill** — when invoked, the agent reads target files and reviews them against the rules, outputting `file:line` findings
2. **Human documentation** — readable design system reference covering the full visual language

## Scope

The guidelines cover 7 areas extracted from the existing codebase:

1. **Color & Tokens** — palette, CSS vars vs `t` object, anti-patterns for raw hex/rgba
2. **Typography** — font weights (Futura Light / BebasKai threshold), fluid `cq-fluid-*` classes, letter-spacing conventions
3. **Spacing & Layout** — container queries (not media queries), breakpoint tiers, standard spacing values
4. **Components** — button hierarchy, `SelectionCard`, form fields, existing UI primitives inventory
5. **Animations & Transitions** — easing, entry animations, interactive feedback, reduced motion
6. **Accessibility** — focus indicators, ARIA patterns, required fields, decorative elements, language
7. **Iframe Constraints** — transparent bg, no viewport units, container queries only, bridge communication, self-hosted fonts

## Approach Chosen

**Approach C: Skill with embedded guidelines.** Single file, always in context when invoked, no network dependency, readable by both humans and agents.

Rejected alternatives:
- **A (skill-only):** Mixed review instructions with rules, harder to read
- **B (skill + separate doc):** Two files to maintain, drift risk

## Anti-Patterns

Each section includes explicit anti-patterns with examples. These flag existing code smells (raw rgba values, inline styles for non-SVG elements, media queries) that should be cleaned up over time and not replicated.
