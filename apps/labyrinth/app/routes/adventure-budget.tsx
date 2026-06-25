import { useState } from "react";
import { Button } from "@pontistudios/ui";
import { Input } from "@pontistudios/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@pontistudios/ui";

interface Adventure {
  id: number;
  name: string;
  cost: number;
}

export default function AdventureBudgetRoute() {
  const [adventures, setAdventures] = useState<Adventure[]>([
    { id: 1, name: "Lakers Game", cost: 845 },
    { id: 2, name: "Dodgers Game", cost: 1200 },
    { id: 3, name: "Flights to London & Mexico", cost: 2300 },
  ]);

  const [newName, setNewName] = useState("");
  const [newCost, setNewCost] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");

  const addAdventure = () => {
    if (newName.trim() && newCost && !isNaN(parseFloat(newCost))) {
      setAdventures([
        ...adventures,
        {
          id: Date.now(),
          name: newName.trim(),
          cost: parseFloat(newCost),
        },
      ]);
      setNewName("");
      setNewCost("");
    }
  };

  const deleteAdventure = (id: number) => {
    setAdventures(adventures.filter((a) => a.id !== id));
  };

  const totalAdventureCost = adventures.reduce((sum, a) => sum + a.cost, 0);
  const savings = parseFloat(currentSavings) || 0;
  const income = parseFloat(monthlyIncome) || 0;
  const expenses = parseFloat(monthlyExpenses) || 0;
  const monthlySavings = income - expenses;
  const remainingAfterAdventures = savings - totalAdventureCost;
  const monthsToSave = monthlySavings > 0 ? Math.ceil(totalAdventureCost / monthlySavings) : 0;
  const canAfford = remainingAfterAdventures >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="min-h-screen cursor-crosshair bg-black font-mono text-white">
      {/* ASCII texture */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden font-mono text-xs leading-none whitespace-pre opacity-10"
        style={{ color: "rgba(255,255,255,0.1)" }}
      >
        {Array(50)
          .fill(0)
          .map((_, i) => (
            <div key={i}>
              {Array(100)
                .fill(0)
                .map(() => {
                  const chars = ["+", "·", "~", "-"];
                  return chars[Math.floor(Math.random() * chars.length)];
                })
                .join("")}
            </div>
          ))}
      </div>

      <div className="relative z-10 mx-auto max-w-6xl p-8">
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="mb-2">ADVENTURE BUDGET PLANNER</h1>
          <p className="text-sm text-white/70">TRACK ADVENTURES AND FORECAST FINANCIAL IMPACT</p>
        </div>

        {/* Financial Input */}
        <Card className="mb-8 border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-sm tracking-tight uppercase">FINANCIAL SNAPSHOT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs text-white/70 uppercase">
                  CURRENT SAVINGS
                </label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  className="border-white/20 bg-white/5 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs text-white/70 uppercase">MONTHLY INCOME</label>
                <Input
                  type="number"
                  placeholder="4000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="border-white/20 bg-white/5 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs text-white/70 uppercase">
                  MONTHLY EXPENSES
                </label>
                <Input
                  type="number"
                  placeholder="3000"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  className="border-white/20 bg-white/5 text-white placeholder:text-white/30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Analysis */}
        {currentSavings && monthlyIncome && monthlyExpenses && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div
              className={`border p-6 ${
                canAfford ? "border-white/20 bg-white/5" : "border-white/30 bg-white/10"
              }`}
            >
              <p className="mb-2 text-xs text-white/70 uppercase">AFTER ADVENTURES</p>
              <p className="mb-2 font-mono text-3xl font-bold text-white">
                {formatCurrency(remainingAfterAdventures)}
              </p>
              <p className="text-xs text-white/70">
                {canAfford ? "✓ WITHIN BUDGET" : "⚠ OVER BUDGET"}
              </p>
            </div>

            <div className="border border-white/20 bg-white/5 p-6">
              <p className="mb-2 text-xs text-white/70 uppercase">MONTHLY SAVINGS</p>
              <p className="mb-2 font-mono text-3xl font-bold text-white">
                {formatCurrency(monthlySavings)}
              </p>
              <p className="text-xs text-white/70">
                {monthlySavings > 0 ? "POSITIVE CASH FLOW" : "DEFICIT MODE"}
              </p>
            </div>

            <div className="border border-white/20 bg-white/5 p-6">
              <p className="mb-2 text-xs text-white/70 uppercase">MONTHS TO SAVE</p>
              <p className="mb-2 font-mono text-3xl font-bold text-white">
                {monthlySavings > 0 ? (remainingAfterAdventures >= 0 ? "0" : monthsToSave) : "∞"}
              </p>
              <p className="text-xs text-white/70">
                {monthlySavings > 0
                  ? canAfford
                    ? "ALREADY COVERED"
                    : "TO COVER ADVENTURES"
                  : "NEEDS POSITIVE SAVINGS"}
              </p>
            </div>
          </div>
        )}

        {/* Total Adventure Cost */}
        <div className="mb-8 border border-white/20 bg-white/5 p-8">
          <p className="mb-2 text-xs text-white/70 uppercase">TOTAL ADVENTURE COST</p>
          <p className="mb-4 font-mono text-5xl font-bold text-white">
            {formatCurrency(totalAdventureCost)}
          </p>
          <div className="space-y-1 text-sm text-white/70">
            <p>
              {adventures.length} ADVENTURE{adventures.length !== 1 ? "S" : ""} PLANNED
            </p>
            {currentSavings && (
              <p>
                {((totalAdventureCost / savings) * 100).toFixed(1)}% OF CURRENT SAVINGS
                {!canAfford && " (EXCEEDS BUDGET)"}
              </p>
            )}
          </div>
        </div>

        {/* Add New Adventure */}
        <Card className="mb-8 border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-sm tracking-tight uppercase">ADD NEW ADVENTURE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="text"
                placeholder="Adventure name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addAdventure()}
                className="flex-1 border-white/20 bg-white/5 text-white placeholder:text-white/30"
              />
              <Input
                type="number"
                placeholder="Cost ($)"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addAdventure()}
                className="w-32 border-white/20 bg-white/5 text-white placeholder:text-white/30"
              />
              <Button
                onClick={addAdventure}
                className="bg-white font-mono font-bold text-black uppercase hover:bg-white/90"
              >
                ADD
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Adventure List */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-sm tracking-tight uppercase">YOUR ADVENTURES</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adventures.map((adventure) => (
                <div
                  key={adventure.id}
                  className="flex items-start justify-between border border-white/10 bg-white/2 p-4 transition hover:bg-white/5"
                >
                  <div>
                    <h3>{adventure.name}</h3>
                    <p className="mt-1 font-mono text-2xl font-bold text-white">
                      {formatCurrency(adventure.cost)}
                    </p>
                    {currentSavings && (
                      <p className="mt-1 text-xs text-white/50">
                        {((adventure.cost / savings) * 100).toFixed(1)}% OF SAVINGS
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteAdventure(adventure.id)}
                    className="rounded p-2 font-mono text-xs text-red-400 text-white/70 uppercase transition hover:bg-white/10 hover:text-red-300 hover:text-white"
                  >
                    DELETE
                  </button>
                </div>
              ))}
              {adventures.length === 0 && (
                <p className="py-8 text-center text-xs text-white/40 uppercase">
                  NO ADVENTURES YET. ADD ONE ABOVE.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
