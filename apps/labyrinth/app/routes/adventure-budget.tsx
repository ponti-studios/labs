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
    <div className="min-h-screen bg-black text-white font-mono cursor-crosshair">
      {/* ASCII texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10 whitespace-pre font-mono text-xs leading-none overflow-hidden"
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

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-mono font-bold tracking-tighter uppercase mb-2">
            ADVENTURE BUDGET PLANNER
          </h1>
          <p className="text-white/70 text-sm">TRACK ADVENTURES AND FORECAST FINANCIAL IMPACT</p>
        </div>

        {/* Financial Input */}
        <Card className="mb-8 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="uppercase text-sm tracking-tight">FINANCIAL SNAPSHOT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase text-white/70 block mb-2">
                  CURRENT SAVINGS
                </label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-white/70 block mb-2">MONTHLY INCOME</label>
                <Input
                  type="number"
                  placeholder="4000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="text-xs uppercase text-white/70 block mb-2">
                  MONTHLY EXPENSES
                </label>
                <Input
                  type="number"
                  placeholder="3000"
                  value={monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/30"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Analysis */}
        {currentSavings && monthlyIncome && monthlyExpenses && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className={`p-6 border ${
                canAfford ? "border-white/20 bg-white/5" : "border-white/30 bg-white/10"
              }`}
            >
              <p className="text-xs uppercase text-white/70 mb-2">AFTER ADVENTURES</p>
              <p className="text-3xl font-mono font-bold text-white mb-2">
                {formatCurrency(remainingAfterAdventures)}
              </p>
              <p className="text-xs text-white/70">
                {canAfford ? "✓ WITHIN BUDGET" : "⚠ OVER BUDGET"}
              </p>
            </div>

            <div className="p-6 border border-white/20 bg-white/5">
              <p className="text-xs uppercase text-white/70 mb-2">MONTHLY SAVINGS</p>
              <p className="text-3xl font-mono font-bold text-white mb-2">
                {formatCurrency(monthlySavings)}
              </p>
              <p className="text-xs text-white/70">
                {monthlySavings > 0 ? "POSITIVE CASH FLOW" : "DEFICIT MODE"}
              </p>
            </div>

            <div className="p-6 border border-white/20 bg-white/5">
              <p className="text-xs uppercase text-white/70 mb-2">MONTHS TO SAVE</p>
              <p className="text-3xl font-mono font-bold text-white mb-2">
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
        <div className="p-8 border border-white/20 bg-white/5 mb-8">
          <p className="text-xs uppercase text-white/70 mb-2">TOTAL ADVENTURE COST</p>
          <p className="text-5xl font-mono font-bold text-white mb-4">
            {formatCurrency(totalAdventureCost)}
          </p>
          <div className="text-sm text-white/70 space-y-1">
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
        <Card className="mb-8 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="uppercase text-sm tracking-tight">ADD NEW ADVENTURE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Adventure name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addAdventure()}
                className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
              <Input
                type="number"
                placeholder="Cost ($)"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addAdventure()}
                className="w-32 bg-white/5 border-white/20 text-white placeholder:text-white/30"
              />
              <Button
                onClick={addAdventure}
                className="bg-white text-black hover:bg-white/90 uppercase font-mono font-bold"
              >
                ADD
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Adventure List */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="uppercase text-sm tracking-tight">YOUR ADVENTURES</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adventures.map((adventure) => (
                <div
                  key={adventure.id}
                  className="flex justify-between items-start p-4 border border-white/10 bg-white/2 hover:bg-white/5 transition"
                >
                  <div>
                    <h3 className="font-mono font-bold text-white uppercase">{adventure.name}</h3>
                    <p className="text-2xl font-mono font-bold text-white mt-1">
                      {formatCurrency(adventure.cost)}
                    </p>
                    {currentSavings && (
                      <p className="text-xs text-white/50 mt-1">
                        {((adventure.cost / savings) * 100).toFixed(1)}% OF SAVINGS
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteAdventure(adventure.id)}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition rounded text-xs uppercase font-mono text-red-400 hover:text-red-300"
                  >
                    DELETE
                  </button>
                </div>
              ))}
              {adventures.length === 0 && (
                <p className="text-white/40 text-center py-8 uppercase text-xs">
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
