# Design system

## Sources of truth

- `app/app.css` is the root for Labs application tokens and the Ponti Studios public-site tokens. The public site uses the `studio-*` color, font, type, and spacing scales exposed through Tailwind utilities.
- `@ponti-studios/ui` supplies shared primitives and its base token contract. `app/app.css` intentionally overrides its app semantic colors for Labs' monochrome product UI.
- `app/storefront.css` contains public-site component and layout rules. It should consume the `--studio-*` tokens from `app/app.css`; add a token there when a value is repeated or expresses a site-wide role.

## Surface themes

The public studio site uses the beige editorial theme: paper/card/warm surfaces, ink text, muted secondary text, brass accents, Instrument Serif display type, Hanken Grotesk body type, and JetBrains Mono labels. The authenticated/product UI keeps its monochrome semantic theme. This is an intentional product boundary, not two competing public-site themes.

## Use the scales

Use semantic color tokens rather than literal colors, and the `font-studio-*`, `text-studio-*`, and `spacing-studio-*` utilities (or their CSS variables) for editorial typography and spacing. Use the shared storefront layout classes such as `.sf-wrap`, `.sf-section`, `.sf-hero`, `.sf-h1`, `.sf-h2`, `.sf-copy`, and `.sf-button` before introducing page-specific rules.

Page-specific geometry is appropriate for unique compositions, responsive breakpoints, and component internals. It should not redefine the shared page width, base palette, type families, or common heading scales. Avoid arbitrary one-off colors and font declarations.

## Intentional local palettes

Data visualizations may use domain-specific categorical colors; game and interactive demos may use a contained identity when that identity is part of the experience; project tiles may reflect the project being shown. Keep these palettes scoped to their component or data layer rather than promoting them into the public site palette. Do not change data meaning to satisfy brand colors.
