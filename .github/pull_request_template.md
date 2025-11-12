## Summary
Unifies theme tokens, fixes contrast, and adds reusable pro containers.

## Changes
- Tokenized palette + surfaces
- Typography + spacing utilities
- Containers: card/panel/callout/section
- Theme toggle + runtime contrast guard
- Replaced inline colors across pages

## Accessibility
- [ ] Pa11y CI passes (no contrast issues)
- [ ] Focus outlines visible
- [ ] Links have non-color affordances where needed

## Screenshots
_(before/after for at least: hero, services, one case page)_

## Risks & Rollback
Low risk to content. Rollback by reverting `assets/css/theme.css`, `assets/js/theme.js`, and class changes.