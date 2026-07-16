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
    <main className="page-shell bg-canvas text-primary">
      <header className="layout-stack">
        <p className="body-4 text-secondary">Page shell</p>
        <h1 className="display-1">A consistent starting point for content pages</h1>
      </header>
      <section className="layout-stack">
        <h2 className="heading-2">Section rhythm</h2>
        <p className="body-1 text-secondary max-w-2xl">
          Page-level breathing room and internal section spacing remain consistent across indexes,
          feeds, and editorial surfaces.
        </p>
      </section>
    </main>
  ),
};

export const ListRows: Story = {
  render: () => (
    <main className="page-shell bg-canvas text-primary">
      <div className="layout-stack">
        <h1 className="display-1">List row rhythm</h1>
        <div className="border-subtle divide-border-subtle divide-y border-b">
          {[
            ["01", "A compact row", "For projects, search results, or activity."],
            ["02", "A readable row", "Consistent padding keeps scanning calm."],
            ["03", "A responsive row", "The same rhythm holds on mobile and desktop."],
          ].map(([index, title, description]) => (
            <div key={index} className="list-row items-start justify-between">
              <span className="body-3 text-secondary tabular-nums">{index}</span>
              <div className="layout-stack min-w-0 flex-1 gap-1">
                <h2 className="heading-3">{title}</h2>
                <p className="body-3 text-secondary">{description}</p>
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
    <main className="page-shell bg-canvas text-primary">
      <div className="layout-stack">
        <h1 className="display-1">List rows with media</h1>
        <div className="border-subtle divide-border-subtle divide-y border-b">
          <div className="list-row items-center">
            <div className="list-media list-media-wide bg-panel" aria-hidden="true">
              <span className="heading-3 text-secondary">WO</span>
            </div>
            <div className="layout-stack min-w-0 gap-1">
              <h2 className="heading-3">Wide media row</h2>
              <p className="body-3 text-secondary">For client or partner marks.</p>
            </div>
          </div>
          <div className="list-row items-center">
            <div className="list-media list-media-square bg-panel" aria-hidden="true">
              <span className="heading-3 text-secondary">PR</span>
            </div>
            <div className="layout-stack min-w-0 gap-1">
              <h2 className="heading-3">Square media row</h2>
              <p className="body-3 text-secondary">For product or project marks.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  ),
};

export const DetailSections: Story = {
  render: () => (
    <main className="bg-canvas text-primary">
      <section className="section section-hero">
        <p className="body-4 text-secondary">Detail hero</p>
        <h1 className="display-1">A detail page with a clear vertical rhythm</h1>
      </section>
      <section className="section">
        <h2 className="heading-2">Standard section</h2>
        <p className="body-1 text-secondary max-w-2xl">
          Sections share a border, gutter, and vertical breathing room without requiring a React
          component.
        </p>
      </section>
      <section className="section gap-8">
        <h2 className="heading-2">Dense section</h2>
        <ol className="layout-stack gap-8">
          <li className="body-1">01 — Start with the problem.</li>
          <li className="body-1">02 — Explain the approach.</li>
          <li className="body-1">03 — Close with the outcome.</li>
        </ol>
      </section>
      <div className="detail-navigation px-4 md:px-6">
        <a className="body-2 text-secondary hover:text-primary" href="#previous">
          ← Previous
        </a>
        <a className="body-2 text-secondary hover:text-primary" href="#next">
          Next →
        </a>
      </div>
    </main>
  ),
};
