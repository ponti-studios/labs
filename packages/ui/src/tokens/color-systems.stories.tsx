import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../components/primitives/button";
import { colorSystems, colorTokenNames, type ColorMode } from "./colors";

const meta: Meta = {
  title: "Foundations/Colors",
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof meta>;

const groups = {
  surfaces: colorTokenNames.filter((token) => token.startsWith("surface-")),
  content: colorTokenNames.filter((token) => token.startsWith("text-")),
  structure: colorTokenNames.filter((token) => token.startsWith("border-")),
  intent: colorTokenNames.filter(
    (token) =>
      token.startsWith("accent") ||
      token.startsWith("destructive") ||
      token.startsWith("success") ||
      token.startsWith("warning") ||
      token === "overlay-scrim" ||
      token === "ring-focus",
  ),
};

function Swatch({ mode, token }: { mode: ColorMode; token: string }) {
  const value = colorSystems.ponti[mode][token as keyof (typeof colorSystems.ponti)[typeof mode]];
  const foreground = token.startsWith("text-") ? value : colorSystems.ponti[mode]["text-primary"];

  return (
    <div className="grid min-w-0 gap-2">
      <div
        className="flex min-h-16 items-end overflow-hidden rounded-md border p-2"
        style={{
          background: value,
          color: foreground,
          borderColor: colorSystems.ponti[mode]["border-default"],
        }}
      >
        <span className="font-mono text-[11px] break-all">Aa</span>
      </div>
      <span
        className="font-mono text-[11px] break-all"
        style={{ color: colorSystems.ponti[mode]["text-secondary"] }}
      >
        {token}
      </span>
    </div>
  );
}

function ThemePanel({ mode }: { mode: ColorMode }) {
  const theme = colorSystems.ponti[mode];

  return (
    <section
      className="grid min-w-0 gap-6 rounded-xl border p-5"
      style={{
        background: theme["surface-canvas"],
        color: theme["text-primary"],
        borderColor: theme["border-default"],
      }}
      aria-label={`Ponti ${mode} color system`}
    >
      <header className="grid gap-2">
        <p className="font-mono text-xs uppercase" style={{ color: theme["text-secondary"] }}>
          Ponti / {mode}
        </p>
        <h2 className="text-xl font-semibold">Semantic roles</h2>
        <p className="max-w-prose text-sm" style={{ color: theme["text-secondary"] }}>
          Components consume meaning, while this palette supplies the light or dark value.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        <Button>Primary action</Button>
        <Button variant="secondary">Secondary action</Button>
        <Button variant="outline">Outline action</Button>
        <Button variant="ghost">Quiet action</Button>
        <Button variant="destructive">Delete item</Button>
      </div>
      <div className="grid gap-6">
        {Object.entries(groups).map(([title, tokens]) => (
          <section key={title} className="grid gap-3">
            <h3 className="text-sm font-semibold capitalize">{title}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {tokens.map((token) => (
                <Swatch key={token} mode={mode} token={token} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export const LightAndDark: Story = {
  render: () => (
    <main className="grid min-h-screen gap-4 bg-slate-100 p-4 md:p-6 dark:bg-slate-950">
      <ThemePanel mode="light" />
      <ThemePanel mode="dark" />
    </main>
  ),
};

export const ButtonStates: Story = {
  render: () => (
    <main className="bg-canvas text-primary grid min-h-screen gap-6 p-6">
      <header className="grid gap-2">
        <h1 className="text-2xl font-semibold">Button state matrix</h1>
        <p className="text-secondary max-w-prose text-sm">
          Inspect hover, focus, press, disabled, destructive, and loading behavior in the toolbar’s
          light and dark modes.
        </p>
      </header>
      <div className="grid max-w-3xl gap-3 sm:grid-cols-2">
        <Button>Primary action</Button>
        <Button variant="secondary">Secondary action</Button>
        <Button variant="outline">Outline action</Button>
        <Button variant="ghost">Quiet action</Button>
        <Button variant="destructive">Delete item</Button>
        <Button variant="link">Read more</Button>
        <Button disabled>Disabled action</Button>
        <Button isLoading loadingLabel="Saving">
          Save changes
        </Button>
      </div>
    </main>
  ),
};
