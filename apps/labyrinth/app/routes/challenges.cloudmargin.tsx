import {
  Button,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pontistudios/ui";
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
  const [statements, setStatements] = useState(initialStatements);
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

      <div className="flex gap-2 mb-4">
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
          <div className="mb-4 p-4 bg-[#f5f5f5] rounded-[4px]">
            <h4>Add New Accrual</h4>
            <div className="grid grid-cols-4 gap-2 items-end">
              <div>
                <Label className="block mb-1 text-sm">Date</Label>
                <Input
                  type="date"
                  value={newAccrual.DATE}
                  onChange={(e) => setNewAccrual((prev) => ({ ...prev, DATE: e.target.value }))}
                />
              </div>
              <div>
                <Label className="block mb-1 text-sm">Rate</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.5"
                  value={newAccrual.RATE}
                  onChange={(e) => setNewAccrual((prev) => ({ ...prev, RATE: e.target.value }))}
                />
              </div>
              <div>
                <Label className="block mb-1 text-sm">Balance</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={newAccrual.BALANCE}
                  onChange={(e) => setNewAccrual((prev) => ({ ...prev, BALANCE: e.target.value }))}
                />
              </div>
              <Button onClick={addAccrual} className="btn btn-primary">
                Add
              </Button>
            </div>
          </div>

          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow className="bg-[#f5f5f5]">
                <TableHead className="p-3 text-left border-b-2 border-[#ddd]">Date</TableHead>
                <TableHead className="p-3 text-right border-b-2 border-[#ddd]">Rate</TableHead>
                <TableHead className="p-3 text-right border-b-2 border-[#ddd]">Balance</TableHead>
                <TableHead className="p-3 text-right border-b-2 border-[#ddd]">Accrual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accruals.map((accrual, idx) => (
                <TableRow key={idx} className="border-b border-[#eee]">
                  <TableCell className="p-3">{accrual.DATE}</TableCell>
                  <TableCell className="p-3 text-right">{accrual.RATE}</TableCell>
                  <TableCell className="p-3 text-right">
                    {accrual.BALANCE.toLocaleString()}
                  </TableCell>
                  <TableCell className="p-3 text-right font-bold">
                    {accrual.ACCRUAL.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <tfoot>
              <TableRow className="font-bold bg-[#f5f5f5]">
                <TableCell className="p-3" colSpan={3}>
                  Total Accruals
                </TableCell>
                <TableCell className="p-3 text-right">{totalAccruals.toLocaleString()}</TableCell>
              </TableRow>
            </tfoot>
          </Table>
        </div>
      ) : (
        <div className="card">
          <h3>Statements</h3>
          <Table className="w-full border-collapse">
            <TableHeader>
              <TableRow className="bg-[#f5f5f5]">
                <TableHead className="p-3 text-left border-b-2 border-[#ddd]">Period</TableHead>
                <TableHead className="p-3 text-right border-b-2 border-[#ddd]">Amendment</TableHead>
                <TableHead className="p-3 text-right border-b-2 border-[#ddd]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statements.map((stmt, idx) => (
                <TableRow key={idx} className="border-b border-[#eee]">
                  <TableCell className="p-3">
                    {stmt.START_DATE} to {stmt.END_DATE}
                  </TableCell>
                  <TableCell
                    className={`p-3 text-right ${stmt.AMENDMENT < 0 ? "text-red-500" : "text-inherit"}`}
                  >
                    {stmt.AMENDMENT.toLocaleString()}
                  </TableCell>
                  <TableCell className="p-3 text-right">{stmt.TOTAL.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
