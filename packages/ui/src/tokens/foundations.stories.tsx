import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta = {
  title: "Foundations/System Lab",
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SpacingAndType: Story = {
  render: () => (
    <main className="bg-canvas text-primary grid min-h-screen gap-10 p-6 md:p-10">
      <section className="grid gap-6">
        <header className="grid gap-2">
          <p className="body-4 text-secondary">Foundations / rhythm</p>
          <h1 className="display-1">Space gives the interface its pace.</h1>
          <p className="body-1 text-secondary max-w-2xl">
            The specimen uses the shared interval scale and the four local typography roles.
          </p>
        </header>
        <div className="grid gap-2">
          {[4, 8, 12, 16, 24, 32, 48, 64].map((size) => (
            <div key={size} className="flex items-center gap-3">
              <span className="text-secondary w-12 font-mono text-xs tabular-nums">{size}px</span>
              <div
                className="bg-accent h-3 rounded-sm"
                style={{ width: size }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </section>
      <section className="border-subtle grid gap-5 rounded-xl border p-6">
        <h2 className="heading-2">Typography roles</h2>
        <div className="grid gap-4">
          <div>
            <p className="text-secondary text-xs uppercase">Display</p>
            <p className="display-2">A clear beginning</p>
          </div>
          <div>
            <p className="text-secondary text-xs uppercase">Body</p>
            <p className="body-1 max-w-2xl">
              Readable content should have room to breathe and should not require the user to decode
              the container.
            </p>
          </div>
          <div>
            <p className="text-secondary text-xs uppercase">Label</p>
            <p className="body-3 font-medium">Current collection</p>
          </div>
          <div>
            <p className="text-secondary text-xs uppercase">Caption</p>
            <p className="body-4 text-secondary">Updated just now</p>
          </div>
        </div>
      </section>
    </main>
  ),
};

export const Surfaces: Story = {
  render: () => (
    <main className="bg-canvas text-primary grid min-h-screen gap-6 p-6 md:p-10">
      <header className="grid gap-2">
        <p className="body-4 text-secondary">Foundations / surfaces</p>
        <h1 className="display-1">Quiet layers, clear ownership.</h1>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-canvas border-subtle grid min-h-40 content-start gap-2 rounded-xl border p-5">
          <h2 className="heading-3">Canvas</h2>
          <p className="body-3 text-secondary">The page background.</p>
        </div>
        <div className="bg-panel border-subtle grid min-h-40 content-start gap-2 rounded-xl border p-5">
          <h2 className="heading-3">Panel</h2>
          <p className="body-3 text-secondary">A contained region.</p>
        </div>
        <div className="bg-raised border-subtle grid min-h-40 content-start gap-2 rounded-xl border p-5">
          <h2 className="heading-3">Raised</h2>
          <p className="body-3 text-secondary">An overlay or elevated layer.</p>
        </div>
        <div className="bg-inset border-subtle grid min-h-40 content-start gap-2 rounded-xl border p-5">
          <h2 className="heading-3">Inset</h2>
          <p className="body-3 text-secondary">A recessed working region.</p>
        </div>
      </div>
    </main>
  ),
};

export const Motion: Story = {
  render: () => (
    <main className="bg-canvas text-primary grid min-h-screen gap-8 p-6 md:p-10">
      <header className="grid gap-2">
        <p className="body-4 text-secondary">Foundations / motion</p>
        <h1 className="display-1">Motion should explain, not perform.</h1>
        <p className="body-1 text-secondary max-w-2xl">
          Use the Storybook motion-reduction setting to confirm that nonessential movement
          disappears.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-panel border-subtle motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 grid min-h-32 place-content-center gap-2 rounded-xl border p-5 duration-150 motion-reduce:animate-none">
          <span className="heading-3">Enter</span>
          <span className="body-4 text-secondary">150ms / 6px</span>
        </div>
        <button className="bg-panel border-subtle text-primary hover:bg-surface-hover active:bg-surface-pressed focus-visible:ring-focus grid min-h-32 place-content-center gap-2 rounded-xl border p-5 text-left focus-visible:ring-2 focus-visible:outline-none motion-safe:transition-colors">
          <span className="heading-3">Press</span>
          <span className="body-4 text-secondary">Immediate feedback</span>
        </button>
        <div className="bg-panel border-subtle grid min-h-32 place-content-center gap-2 rounded-xl border p-5 motion-safe:animate-pulse motion-reduce:animate-none">
          <span className="heading-3">Loading</span>
          <span className="body-4 text-secondary">Geometry remains stable</span>
        </div>
      </div>
    </main>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <main className="bg-canvas text-primary grid min-h-screen gap-8 p-6 md:p-10">
      <header className="grid gap-2">
        <p className="body-4 text-secondary">Foundations / accessibility</p>
        <h1 className="display-1">The system should be calm for everyone.</h1>
      </header>
      <section className="border-subtle grid max-w-2xl gap-5 rounded-xl border p-6">
        <label className="grid gap-2">
          <span className="body-3 font-medium">Email address</span>
          <input
            className="bg-canvas border-default text-primary focus-visible:ring-focus h-11 rounded-md border px-3 outline-none focus-visible:ring-2"
            placeholder="you@example.com"
          />
          <span className="body-4 text-secondary">Use a reachable address for notifications.</span>
        </label>
        <div className="flex flex-wrap gap-3">
          <button className="bg-accent text-on-accent focus-visible:ring-focus min-h-11 rounded-md px-4 focus-visible:ring-2 focus-visible:outline-none">
            Continue
          </button>
          <button disabled className="bg-panel text-disabled min-h-11 rounded-md px-4">
            Unavailable
          </button>
        </div>
        <p className="body-4 text-destructive" role="alert">
          Example error: enter a valid email address.
        </p>
      </section>
    </main>
  ),
};
