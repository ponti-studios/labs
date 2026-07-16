import { Button, Label } from "@pontistudios/ui/primitives";
import { Input } from "@pontistudios/ui/forms";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@pontistudios/ui/data-display";
import { useState } from "react";

const initialAccruals = [
  { DATE: "2017-01-01", RATE: 0.5, BALANCE: 10000, ACCRUAL: 5000 },
  { DATE: "2017-01-02", RATE: 0.5, BALANCE: 12000, ACCRUAL: 6000 },
  { DATE: "2017-01-03", RATE: 0.5, BALANCE: 0, ACCRUAL: 0 },
  { DATE: "2017-01-04", RATE: 0.25, BALANCE: 10000, ACCRUAL: 2500 },
  { DATE: "2017-01-05", RATE: 0.5, BALANCE: 10000, ACCRUAL: 5000 },
];

const initialStatements = [
  { AMENDMENT: -300, START_DATE: "2017-01-01", END_DATE: "2017-01-31", TOTAL: 18200 },
  { AMENDMENT: 0, START_DATE: "2017-02-01", END_DATE: "2017-02-28", TOTAL: 0 },
  { AMENDMENT: 555.55, START_DATE: "2017-01-03", END_DATE: "2017-03-31", TOTAL: 555.55 },
];

function getAccrual(balance: number, rate: number): number {
  return Math.floor(balance * rate);
}

/**
 * CloudMargin Take-Home Challenge
 *
 * Task: Build a React interface to manage and display 'Accruals' and 'Statements'.
 * The application must render dynamic data grids and allow the user to add or amend financial records.
 */
export default function CloudMargin() {
  const [accruals, setAccruals] = useState(initialAccruals);
  const [statements] = useState(initialStatements);
  const [selectedTab, setSelectedTab] = useState("accruals");
  const [newAccrual, setNewAccrual] = useState({ DATE: "", RATE: "", BALANCE: "" });

  const addAccrual = () => {
    const balance = parseFloat(newAccrual.BALANCE) || 0;
    const rate = parseFloat(newAccrual.RATE) || 0;
    const accrual = {
      DATE: newAccrual.DATE,
      RATE: rate,
      BALANCE: balance,
      ACCRUAL: getAccrual(balance, rate),
    };
    setAccruals([...accruals, accrual]);
    setNewAccrual({ DATE: "", RATE: "", BALANCE: "" });
  };

  const totalAccruals = accruals.reduce((sum, a) => sum + a.ACCRUAL, 0);

  return (
    <div>
      <h2>CloudMargin - Accrual Calculator</h2>
      <p>
        An accrual calculator for financial contracts. Originally a Node/Express app with Jasmine
        tests.
      </p>

      <div className="mb-4 flex gap-2">
        <Button
          onClick={() => setSelectedTab("accruals")}
          className={`btn ${selectedTab === "accruals" ? "btn-primary" : ""}`}
        >
          Accruals
        </Button>
        <Button
          onClick={() => setSelectedTab("statements")}
          className={`btn ${selectedTab === "statements" ? "btn-primary" : ""}`}
        >
          Statements
        </Button>
      </div>

      {selectedTab === "accruals" ? (
        <div className="card">
          <h3>Accruals</h3>
          <div className="mb-4 rounded-[4px] bg-[#f5f5f5] p-4">
            <h4>Add New Accrual</h4>
            <div className="grid grid-cols-4 items-end gap-2">
              <div>
                <Label className="mb-1 block text-sm">Date</Label>
                <Input
                  type="date"
                  value={newAccrual.DATE}
                  onChange={(e) => setNewAccrual((prev) => ({ ...prev, DATE: e.target.value }))}
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm">Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.5"
                  value={newAccrual.RATE}
                  onChange={(e) => setNewAccrual((prev) => ({ ...prev, RATE: e.target.value }))}
                />
              </div>
              <div>
                <Label className="mb-1 block text-sm">Balance</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={newAccrual.BALANCE}
                  onChange={(e) => setNewAccrual((prev) => ({ ...prev, BALANCE: e.target.value }))}
                />
              </div>
              <Button onClick={addAccrual}>Add</Button>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Accrual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accruals.map((accrual, idx) => (
                <TableRow key={idx}>
                  <TableCell>{accrual.DATE}</TableCell>
                  <TableCell className="text-right">{accrual.RATE}</TableCell>
                  <TableCell className="text-right">{accrual.BALANCE.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold">
                    {accrual.ACCRUAL.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="font-bold">
                <TableCell colSpan={3}>Total Accruals</TableCell>
                <TableCell className="text-right">{totalAccruals.toLocaleString()}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      ) : (
        <div className="card">
          <h3>Statements</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Amendment</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statements.map((stmt, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    {stmt.START_DATE} to {stmt.END_DATE}
                  </TableCell>
                  <TableCell
                    className={`text-right ${stmt.AMENDMENT < 0 ? "text-red-500" : "text-inherit"}`}
                  >
                    {stmt.AMENDMENT.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">{stmt.TOTAL.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
