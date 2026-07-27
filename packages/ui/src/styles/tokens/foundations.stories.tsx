import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = { title: "Foundations/Tailwind Defaults", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj<typeof meta>;

export const SpacingAndType: Story = {
  render: () => (
    <main className="bg-background text-foreground grid min-h-screen gap-10 p-6 md:p-10">
      <section className="grid gap-6">
        <header className="grid gap-2">
          <p className="text-muted-foreground text-sm">Foundations / rhythm</p>
          <h1 className="text-4xl font-semibold tracking-tight">Tailwind defaults, directly.</h1>
          <p className="text-muted-foreground max-w-2xl text-base">
            The specimen uses the shared Tailwind spacing and type scales.
          </p>
        </header>
        <div className="grid gap-2">
          {[1, 2, 3, 4, 6, 8, 12, 16].map((size) => (
            <div key={size} className="flex items-center gap-3">
              <span className="text-muted-foreground w-12 font-mono text-xs tabular-nums">
                {size}
              </span>
              <div
                className="bg-accent h-3 rounded-sm"
                style={{ width: `calc(var(--spacing) * ${size})` }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </section>
      <section className="border-border bg-card grid gap-5 rounded-xl border p-6">
        <h2 className="text-2xl font-semibold">Typography scale</h2>
        <div className="grid gap-4">
          {(
            [
              "text-xs",
              "text-sm",
              "text-base",
              "text-lg",
              "text-xl",
              "text-2xl",
              "text-4xl",
            ] as const
          ).map((size) => (
            <p key={size} className={`${size} text-foreground`}>
              {size}
            </p>
          ))}
        </div>
      </section>
    </main>
  ),
};

export const Surfaces: Story = {
  render: () => (
    <main className="bg-background text-foreground grid min-h-screen gap-6 p-6 md:p-10">
      <header className="grid gap-2">
        <p className="text-muted-foreground text-sm">Foundations / surfaces</p>
        <h1 className="text-4xl font-semibold tracking-tight">Standard semantic layers.</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Background", "bg-background"],
          ["Card", "bg-card"],
          ["Popover", "bg-popover"],
          ["Muted", "bg-muted"],
        ].map(([name, className]) => (
          <div
            key={name}
            className={`${className} border-border grid min-h-40 content-start gap-2 rounded-xl border p-5`}
          >
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="text-muted-foreground text-sm">{className}</p>
          </div>
        ))}
      </div>
    </main>
  ),
};

export const Motion: Story = {
  render: () => (
    <main className="bg-background text-foreground grid min-h-screen gap-8 p-6 md:p-10">
      <header className="grid gap-2">
        <p className="text-muted-foreground text-sm">Foundations / motion</p>
        <h1 className="text-4xl font-semibold tracking-tight">
          Motion stays standard and reducible.
        </h1>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="motion-safe:animate-in motion-safe:fade-in-0 border-border bg-card grid min-h-32 place-content-center gap-2 rounded-xl border p-5 motion-reduce:animate-none">
          <span className="text-lg font-semibold">Enter</span>
          <span className="text-muted-foreground text-sm">150ms</span>
        </div>
        <button className="border-border bg-card hover:bg-accent focus-visible:ring-ring grid min-h-32 place-content-center gap-2 rounded-xl border p-5 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none">
          <span className="text-lg font-semibold">Press</span>
          <span className="text-muted-foreground text-sm">System focus</span>
        </button>
        <div className="border-border bg-card grid min-h-32 place-content-center gap-2 rounded-xl border p-5 motion-safe:animate-pulse motion-reduce:animate-none">
          <span className="text-lg font-semibold">Loading</span>
          <span className="text-muted-foreground text-sm">Stable geometry</span>
        </div>
      </div>
    </main>
  ),
};
