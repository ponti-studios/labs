import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = { title: "Foundations/Tailwind Defaults", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj<typeof meta>;

export const SpacingAndType: Story = {
  render: () => (
    <main className="grid min-h-screen gap-10 bg-background p-6 text-foreground md:p-10">
      <section className="grid gap-6">
        <header className="grid gap-2">
          <p className="text-sm text-muted-foreground">Foundations / rhythm</p>
          <h1 className="text-4xl font-semibold tracking-tight">Tailwind defaults, directly.</h1>
          <p className="max-w-2xl text-base text-muted-foreground">The specimen uses the shared Tailwind spacing and type scales.</p>
        </header>
        <div className="grid gap-2">
          {[1, 2, 3, 4, 6, 8, 12, 16].map((size) => (
            <div key={size} className="flex items-center gap-3">
              <span className="w-12 font-mono text-xs tabular-nums text-muted-foreground">{size}</span>
              <div className="h-3 rounded-sm bg-accent" style={{ width: `calc(var(--spacing) * ${size})` }} aria-hidden="true" />
            </div>
          ))}
        </div>
      </section>
      <section className="grid gap-5 rounded-xl border border-border bg-card p-6">
        <h2 className="text-2xl font-semibold">Typography scale</h2>
        <div className="grid gap-4">
          {(["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-4xl"] as const).map((size) => (
            <p key={size} className={`${size} text-foreground`}>{size}</p>
          ))}
        </div>
      </section>
    </main>
  ),
};

export const Surfaces: Story = {
  render: () => (
    <main className="grid min-h-screen gap-6 bg-background p-6 text-foreground md:p-10">
      <header className="grid gap-2"><p className="text-sm text-muted-foreground">Foundations / surfaces</p><h1 className="text-4xl font-semibold tracking-tight">Standard semantic layers.</h1></header>
      <div className="grid gap-4 md:grid-cols-2">
        {[["Background", "bg-background"], ["Card", "bg-card"], ["Popover", "bg-popover"], ["Muted", "bg-muted"]].map(([name, className]) => <div key={name} className={`${className} grid min-h-40 content-start gap-2 rounded-xl border border-border p-5`}><h2 className="text-lg font-semibold">{name}</h2><p className="text-sm text-muted-foreground">{className}</p></div>)}
      </div>
    </main>
  ),
};

export const Motion: Story = {
  render: () => (
    <main className="grid min-h-screen gap-8 bg-background p-6 text-foreground md:p-10">
      <header className="grid gap-2"><p className="text-sm text-muted-foreground">Foundations / motion</p><h1 className="text-4xl font-semibold tracking-tight">Motion stays standard and reducible.</h1></header>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="motion-safe:animate-in motion-safe:fade-in-0 grid min-h-32 place-content-center gap-2 rounded-xl border border-border bg-card p-5 motion-reduce:animate-none"><span className="text-lg font-semibold">Enter</span><span className="text-sm text-muted-foreground">150ms</span></div>
        <button className="grid min-h-32 place-content-center gap-2 rounded-xl border border-border bg-card p-5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"><span className="text-lg font-semibold">Press</span><span className="text-sm text-muted-foreground">System focus</span></button>
        <div className="grid min-h-32 place-content-center gap-2 rounded-xl border border-border bg-card p-5 motion-safe:animate-pulse motion-reduce:animate-none"><span className="text-lg font-semibold">Loading</span><span className="text-sm text-muted-foreground">Stable geometry</span></div>
      </div>
    </main>
  ),
};
