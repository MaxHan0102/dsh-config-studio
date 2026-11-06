## 0.2.0-dev.2 — unreleased

- Align typography, spacing, cards, tabs and controls with the host settings and installed plugin marketplace.
- Use compact entry IDs, quieter source labels and a two-column settings layout that stacks at narrow widths.
- Add consistent search, refresh, back and dialog-close icons, including a clear-search control.
- Match dialog surfaces and focus styles to host theme tokens; retain full keyboard focus handling.
- Keep the save bar sticky while edits are pending and in normal flow otherwise.
- Localize the theme options and keep raw field keys in technical details and label tooltips.

## 0.2.0-dev.1 — unreleased

- Read effective defaults without merging whole-config overrides into inherited values.
- Check revisions and construct changes under the host writer's lock.
- Protect nested secret/reference roles, inherited/default branches and expression markers; sanitize API failures.
- Validate UTF-8 request size and the resulting configuration size, allowing existing oversized entries to shrink.
- Preserve drafts, support explicit conflict review, and allow invalid drafts to be discarded.
- Show inherited reset targets and distinguish unset values from null in previews.
- Trap dialog focus, consume Escape and restore focus after closing.
- Add localized search, modified/unavailable/recent filters, field search and a sticky save bar.
- Add structured object/simple-array controls, schema descriptions, ranges and JSON formatting.
- Add bounded session-only save history with revision-protected undo.
- Add host and React regression tests and an isolated loopback test page.
- Correct the development environment instructions and document the limits of drafts and history.
