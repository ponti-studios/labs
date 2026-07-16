import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "Foundations/Layout Rhythm",
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const PageShell: Story = {
  render: () => (
    <main className="page-shell bg-bg-base text-text-primary">
      <header className="content-stack">
        <p className="body-4 text-text-secondary">Page shell</p>
        <h1 className="display-1">A consistent starting point for content pages</h1>
      </header>
      <section className="content-stack">
        <h2 className="heading-2">Section rhythm</h2>
        <p className="body-1 text-text-secondary max-w-2xl">
          Page-level breathing room and internal section spacing remain consistent across indexes,
          feeds, and editorial surfaces.
        </p>
      </section>
    </main>
  ),
};

export const ListRows: Story = {
  render: () => (
    <main className="page-shell bg-bg-base text-text-primary">
      <div className="content-stack">
        <h1 className="display-1">List row rhythm</h1>
        <div className="border-border/40 divide-border/40 divide-y border-b">
          {[
            ["01", "A compact row", "For projects, search results, or activity."],
            ["02", "A readable row", "Consistent padding keeps scanning calm."],
            ["03", "A responsive row", "The same rhythm holds on mobile and desktop."],
          ].map(([index, title, description]) => (
            <div key={index} className="content-list-row items-start justify-between">
              <span className="body-3 text-text-secondary tabular-nums">{index}</span>
              <div className="content-stack min-w-0 flex-1 gap-1">
                <h2 className="heading-3">{title}</h2>
                <p className="body-3 text-text-secondary">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  ),
};

export const ListRowsWithMedia: Story = {
  render: () => (
    <main className="page-shell bg-bg-base text-text-primary">
      <div className="content-stack">
        <h1 className="display-1">List rows with media</h1>
        <div className="border-border/40 divide-border/40 divide-y border-b">
          <div className="content-list-row items-center">
            <div className="content-list-media content-list-media-wide bg-bg-surface" aria-hidden="true">
              <span className="heading-3 text-text-secondary">WO</span>
            </div>
            <div className="content-stack min-w-0 gap-1">
              <h2 className="heading-3">Wide media row</h2>
              <p className="body-3 text-text-secondary">For client or partner marks.</p>
            </div>
          </div>
          <div className="content-list-row items-center">
            <div
              className="content-list-media content-list-media-square bg-bg-surface"
              aria-hidden="true"
            >
              <span className="heading-3 text-text-secondary">PR</span>
            </div>
            <div className="content-stack min-w-0 gap-1">
              <h2 className="heading-3">Square media row</h2>
              <p className="body-3 text-text-secondary">For product or project marks.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  ),
};

export const DetailSections: Story = {
  render: () => (
    <main className="bg-bg-base text-text-primary">
      <section className="content-section content-section-hero">
        <p className="body-4 text-text-secondary">Detail hero</p>
        <h1 className="display-1">A detail page with a clear vertical rhythm</h1>
      </section>
      <section className="content-section">
        <h2 className="heading-2">Standard section</h2>
        <p className="body-1 text-text-secondary max-w-2xl">
          Sections share a border, gutter, and vertical breathing room without requiring a React
          component.
        </p>
      </section>
      <section className="content-section gap-8">
        <h2 className="heading-2">Dense section</h2>
        <ol className="content-stack gap-8">
          <li className="body-1">01 — Start with the problem.</li>
          <li className="body-1">02 — Explain the approach.</li>
          <li className="body-1">03 — Close with the outcome.</li>
        </ol>
      </section>
      <div className="content-navigation px-4 md:px-6">
        <a className="body-2 text-text-secondary hover:text-text-primary" href="#previous">
          ← Previous
        </a>
        <a className="body-2 text-text-secondary hover:text-text-primary" href="#next">
          Next →
        </a>
      </div>
    </main>
  ),
};
