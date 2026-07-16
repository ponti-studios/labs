---
type: component-platform
owner: ponti-studios
platform: web
status: canonical
---

# Web Components

Web components implement the [shared component contract](shared.md) through the strengths of the web. Web is a first-class platform, not a fallback rendering target for native ideas.

## Web expression

Use the web’s capabilities deliberately:

- URLs and deep links make state and content addressable.
- Browser history supports understandable navigation and recovery.
- Keyboard focus and shortcuts make precision interaction available.
- Hover and pointer feedback can clarify affordance without replacing other feedback.
- Responsive layout lets one experience adapt across widths.
- Native HTML semantics, copyability, and progressive enhancement preserve interoperability.

Do not imitate a mobile operating system when the browser has a clearer native pattern. A web sheet, dialog, menu, or navigation pattern should feel deliberate in a browser, including its URL, focus, keyboard, resize, and history behavior where relevant.

## Web requirements

- Use semantic HTML and expose correct accessible names and relationships.
- Preserve a visible keyboard focus state.
- Support pointer, keyboard, touch, and narrow layouts where the component is used.
- Keep interactive targets at least 44px.
- Use hover as supplementary feedback; never make it the only indication of state.
- Manage focus and dismissal for sheets, dialogs, popovers, alerts, and menus.
- Respect `prefers-reduced-motion` and forced-colors environments.

Buttons, fields, overlays, and feedback components should share semantic state names and tokens with native implementations while using browser-appropriate mechanics.
