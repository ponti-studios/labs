import { useState, type ChangeEvent, type JSX } from "react";

interface Accrual {
  ACCRUAL: number;
  BALANCE: number;
  DATE: string;
  RATE: number;
}

interface Statement {
  AMENDMENT: number;
  END_DATE: string;
  START_DATE: string;
  TOTAL: number;
}

interface AccrualDraft {
  BALANCE: string;
  DATE: string;
  RATE: string;
}

type SelectedTab = "accruals" | "statements";

const initialAccruals: Accrual[] = [
  { DATE: "2017-01-01", RATE: 0.5, BALANCE: 10000, ACCRUAL: 5000 },
  { DATE: "2017-01-02", RATE: 0.5, BALANCE: 12000, ACCRUAL: 6000 },
  { DATE: "2017-01-03", RATE: 0.5, BALANCE: 0, ACCRUAL: 0 },
  { DATE: "2017-01-04", RATE: 0.25, BALANCE: 10000, ACCRUAL: 2500 },
  { DATE: "2017-01-05", RATE: 0.5, BALANCE: 10000, ACCRUAL: 5000 },
];

const initialStatements: Statement[] = [
  { AMENDMENT: -300, START_DATE: "2017-01-01", END_DATE: "2017-01-31", TOTAL: 18200 },
  { AMENDMENT: 0, START_DATE: "2017-02-01", END_DATE: "2017-02-28", TOTAL: 0 },
  { AMENDMENT: 555.55, START_DATE: "2017-01-03", END_DATE: "2017-03-31", TOTAL: 555.55 },
];

function getAccrual(balance: number, rate: number): number {
  return Math.floor(balance * rate);
}

function createEmptyAccrualDraft(): AccrualDraft {
  return { DATE: "", RATE: "", BALANCE: "" };
}

export default function CloudMargin(): JSX.Element {
  const [accruals, setAccruals] = useState<Accrual[]>(initialAccruals);
  const [selectedTab, setSelectedTab] = useState<SelectedTab>("accruals");
  const [newAccrual, setNewAccrual] = useState<AccrualDraft>(createEmptyAccrualDraft);

  const addAccrual = (): void => {
    const balance = Number.parseFloat(newAccrual.BALANCE) || 0;
    const rate = Number.parseFloat(newAccrual.RATE) || 0;
    const accrual: Accrual = {
      DATE: newAccrual.DATE,
      RATE: rate,
      BALANCE: balance,
      ACCRUAL: getAccrual(balance, rate),
    };

    setAccruals([...accruals, accrual]);
    setNewAccrual(createEmptyAccrualDraft());
  };

  const handleDraftChange =
    (field: keyof AccrualDraft) => (event: ChangeEvent<HTMLInputElement>): void => {
      setNewAccrual((previousDraft) => ({ ...previousDraft, [field]: event.target.value }));
    };

  const totalAccruals = accruals.reduce((sum, accrual) => sum + accrual.ACCRUAL, 0);

  return (
    <div>
      <h2>CloudMargin - Accrual Calculator</h2>
      <p>
        An accrual calculator for financial contracts. Originally a Node/Express app with Jasmine
        tests.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setSelectedTab("accruals")}
          className={`btn ${selectedTab === "accruals" ? "btn-primary" : ""}`}
        >
          Accruals
        </button>
        <button
          onClick={() => setSelectedTab("statements")}
          className={`btn ${selectedTab === "statements" ? "btn-primary" : ""}`}
        >
          Statements
        </button>
      </div>

      {selectedTab === "accruals" ? (
        <div className="card">
          <h3>Accruals</h3>
          <div
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              background: "#f5f5f5",
              borderRadius: "4px",
            }}
          >
            <h4>Add New Accrual</h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "0.5rem",
                alignItems: "end",
              }}
            >
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Date
                </label>
                <input
                  type="date"
                  value={newAccrual.DATE}
                  onChange={handleDraftChange("DATE")}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Rate
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.5"
                  value={newAccrual.RATE}
                  onChange={handleDraftChange("RATE")}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                  Balance
                </label>
                <input
                  type="number"
                  placeholder="10000"
                  value={newAccrual.BALANCE}
                  onChange={handleDraftChange("BALANCE")}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <button onClick={addAccrual} className="btn btn-primary">
                Add
              </button>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th
                  style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}
                >
                  Date
                </th>
                <th
                  style={{ padding: "0.75rem", textAlign: "right", borderBottom: "2px solid #ddd" }}
                >
                  Rate
                </th>
                <th
                  style={{ padding: "0.75rem", textAlign: "right", borderBottom: "2px solid #ddd" }}
                >
                  Balance
                </th>
                <th
                  style={{ padding: "0.75rem", textAlign: "right", borderBottom: "2px solid #ddd" }}
                >
                  Accrual
                </th>
              </tr>
            </thead>
            <tbody>
              {accruals.map((accrual, index) => (
                <tr key={`${accrual.DATE}-${index}`} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.75rem" }}>{accrual.DATE}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right" }}>{accrual.RATE}</td>
                  <td style={{ padding: "0.75rem", textAlign: "right" }}>
                    {accrual.BALANCE.toLocaleString()}
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: "bold" }}>
                    {accrual.ACCRUAL.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: "bold", background: "#f5f5f5" }}>
                <td style={{ padding: "0.75rem" }} colSpan={3}>
                  Total Accruals
                </td>
                <td style={{ padding: "0.75rem", textAlign: "right" }}>
                  {totalAccruals.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="card">
          <h3>Statements</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th
                  style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #ddd" }}
                >
                  Period
                </th>
                <th
                  style={{ padding: "0.75rem", textAlign: "right", borderBottom: "2px solid #ddd" }}
                >
                  Amendment
                </th>
                <th
                  style={{ padding: "0.75rem", textAlign: "right", borderBottom: "2px solid #ddd" }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {initialStatements.map((statement, index) => (
                <tr key={`${statement.START_DATE}-${index}`} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.75rem" }}>
                    {statement.START_DATE} to {statement.END_DATE}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      textAlign: "right",
                      color: statement.AMENDMENT < 0 ? "red" : "inherit",
                    }}
                  >
                    {statement.AMENDMENT.toLocaleString()}
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "right" }}>
                    {statement.TOTAL.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}