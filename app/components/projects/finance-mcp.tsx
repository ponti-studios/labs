/**
 * Showcase blocks for the Finance MCP project page. An MCP server has no screens,
 * so the page shows what an agent sees: a conversation with tool calls, an import
 * log, the tool catalog, and the path from spreadsheet to ledger. All figures in the
 * hero are sample values.
 */

type ToolGroup = {
  label: string;
  tools: { name: string; summary: string; write?: boolean }[];
};

const TOOL_GROUPS: ToolGroup[] = [
  {
    label: "Position",
    tools: [
      { name: "finance_net_worth", summary: "Assets minus debts, with history." },
      { name: "finance_accounts", summary: "Every account; closed ones on request." },
      { name: "finance_runway", summary: "Months of cash at the current burn." },
      { name: "finance_monthly_stats", summary: "Income, spend and savings rate by month." },
    ],
  },
  {
    label: "Spending",
    tools: [
      { name: "finance_spending_by_category", summary: "Where the money went in a date range." },
      { name: "finance_budget_breakdown", summary: "Planned against actual, per category." },
      { name: "finance_top_merchants", summary: "Biggest payees, ranked." },
      { name: "finance_tag_breakdown", summary: "Totals grouped by your own tags." },
      { name: "finance_categories", summary: "The category list." },
    ],
  },
  {
    label: "Transactions",
    tools: [
      { name: "finance_transaction_search", summary: "Find by text, amount, tag or date." },
      { name: "finance_recent_transactions", summary: "The latest activity across accounts." },
      {
        name: "finance_transaction_upsert",
        summary: "Add or correct one transaction.",
        write: true,
      },
      {
        name: "finance_transactions_import",
        summary: "Bulk load with a dry run first.",
        write: true,
      },
    ],
  },
];

const FLOW_STEPS = [
  { tag: "source", title: "Sheet", body: "16,426 rows from years of manual tracking." },
  { tag: "check", title: "Dry run", body: "Same counters as the real call, nothing written." },
  { tag: "write", title: "Import", body: "Natural-key upsert. Re-running changes nothing." },
  {
    tag: "store",
    title: "Postgres",
    body: "14,486 reconciled transactions behind the Hominem API.",
  },
  { tag: "ask", title: "Any agent", body: "Claude or another MCP client, scoped to your account." },
];

export function FinanceMcpHero() {
  return (
    <div className="sf-mcp-hero">
      <div className="sf-mcp-stage">
        <div className="sf-mcp-panel">
          <div className="sf-mcp-bar">
            <span className="sf-mcp-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            Claude · Finance MCP
            <span className="sf-mcp-tag">connected</span>
          </div>
          <div className="sf-mcp-chat">
            <p className="sf-mcp-me">
              How long can I go on savings if I cut dining out by a third?
            </p>
            <div className="sf-mcp-ai">
              <details className="sf-mcp-call">
                <summary>
                  <span className="sf-mcp-check" aria-hidden="true">
                    ✓
                  </span>
                  <span className="sf-mcp-call-name">finance_spending_by_category</span>
                  <span className="sf-mcp-ms">212 ms</span>
                </summary>
                <pre>{`{ "from": "2026-07-01", "to": "2026-09-30" }
→ Dining 1,284.00 · Groceries 902.50 · Transit 311.00 ...`}</pre>
              </details>
              <details className="sf-mcp-call">
                <summary>
                  <span className="sf-mcp-check" aria-hidden="true">
                    ✓
                  </span>
                  <span className="sf-mcp-call-name">finance_runway</span>
                  <span className="sf-mcp-ms">148 ms</span>
                </summary>
                <pre>{`{ "monthlyCutCents": 14267 }
→ cash 24,310.00 · burn 3,962.00/mo`}</pre>
              </details>
              <p>
                Dining ran about $428 a month last quarter. A one-third cut saves roughly $143,
                which stretches your runway by close to a week.
              </p>
              <dl className="sf-mcp-figs">
                <div>
                  <dt>Runway now</dt>
                  <dd>6.1 mo</dd>
                </div>
                <div>
                  <dt>With the cut</dt>
                  <dd>6.4 mo</dd>
                </div>
                <div>
                  <dt>Saved / mo</dt>
                  <dd>$143</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="sf-mcp-panel sf-mcp-dark">
          <div className="sf-mcp-bar">
            <span className="sf-mcp-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            finance_transactions_import
            <span className="sf-mcp-tag">dryRun: true</span>
          </div>
          <pre className="sf-mcp-term">
            <span className="k">&gt;</span> <span className="w">16,426 rows in</span>
            {"\n"}
            <span className="g">✓</span> 14,486 new · 1,940 duplicates skipped{"\n"}
            <span className="g">✓</span> 0 would overwrite existing{"\n"}
            <span className="r">✕</span> 3 rejected{"\n"}
            {"  "}
            <span className="r">unknown_account</span> ×2{"\n"}
            {"  "}
            <span className="r">bad_amount</span> ×1{"\n\n"}
            <span className="k">&gt;</span> <span className="w">re-run with dryRun: false</span>
            {"\n"}
            <span className="g">✓</span> created 14,486 · safe to repeat
          </pre>
        </div>
      </div>
      <p className="sf-mcp-sample">Sample figures from a fabricated account.</p>
    </div>
  );
}

export function FinanceMcpDetails() {
  return (
    <>
      <section className="sf-wrap sf-mcp-section" aria-labelledby="sf-mcp-tools">
        <p className="sf-mcp-eyebrow">What the agent can call</p>
        <h2 className="sf-h2" id="sf-mcp-tools">
          Thirteen tools, one ledger.
        </h2>
        <p className="sf-mcp-lede">
          Reads answer questions about your money. Writes are idempotent, so an import you run
          twice does the same thing as one you run once.
        </p>
        <div className="sf-mcp-catalog">
          {TOOL_GROUPS.map((group) => (
            <div className="sf-mcp-group" key={group.label}>
              <h3>{group.label}</h3>
              {group.tools.map((tool) => (
                <div className="sf-mcp-tool" key={tool.name}>
                  <code>{tool.name}</code>
                  {tool.write ? <span className="sf-mcp-write">write</span> : null}
                  <p>{tool.summary}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="sf-wrap sf-mcp-section" aria-labelledby="sf-mcp-flow">
        <p className="sf-mcp-eyebrow">How a spreadsheet becomes a ledger</p>
        <h2 className="sf-h2" id="sf-mcp-flow">
          The port, end to end.
        </h2>
        <div className="sf-mcp-flow-scroll">
          <ol className="sf-mcp-flow">
            {FLOW_STEPS.map((step) => (
              <li key={step.title}>
                <small>{step.tag}</small>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
