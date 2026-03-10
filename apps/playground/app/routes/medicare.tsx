import { useState } from "react";
import {
  Badge,
  Button,
  Slider,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@pontistudios/ui";

const STANDARD_PREMIUM = 174.7;
const STANDARD_DEDUCTIBLE = 240;

const INCOME_BRACKETS = [
  { max: 103000, additional: 0 },
  { max: 129000, additional: 69.9 },
  { max: 161000, additional: 174.7 },
  { max: 193000, additional: 279.5 },
  { max: 500000, additional: 384.3 },
  { max: Infinity, additional: 419.3 },
];

const AVAILABLE_PLANS = [
  {
    id: "standard",
    name: "MEDICARE PART B STANDARD",
    type: "Original Medicare",
    description: "BASIC COVERAGE FOR MEDICAL SERVICES AND SUPPLIES",
    premium: STANDARD_PREMIUM,
    deductible: STANDARD_DEDUCTIBLE,
    coinsurance: 0.2,
    coverageLimit: null,
    extras: [],
  },
  {
    id: "medigap-g",
    name: "MEDIGAP PLAN G",
    type: "Supplemental",
    description: "COVERS MOST OUT-OF-POCKET COSTS EXCEPT PART B DEDUCTIBLE",
    premium: 150,
    deductible: 0,
    coinsurance: undefined,
    additionalCoverage: "all except Part B deductible",
    coverageLimit: null,
    extras: ["Foreign travel emergency", "Part B excess charges"],
  },
  {
    id: "medigap-n",
    name: "MEDIGAP PLAN N",
    type: "Supplemental",
    description: "LOWER PREMIUM WITH SOME COPAYS FOR OFFICE VISITS",
    premium: 120,
    deductible: 0,
    coinsurance: undefined,
    additionalCoverage: "most costs with copays",
    coverageLimit: null,
    extras: ["Foreign travel emergency"],
    copays: "UP TO $20 FOR OFFICE VISITS, $50 FOR ER",
  },
  {
    id: "ma-ppo",
    name: "MEDICARE ADVANTAGE PPO",
    type: "Medicare Advantage",
    description: "NETWORK-BASED PLAN WITH OUT-OF-NETWORK OPTIONS",
    premium: 35,
    deductible: 150,
    coinsurance: 0.15,
    coverageLimit: 5000,
    extras: ["Vision", "Dental", "Prescription drugs"],
    networkRestrictions: true,
  },
  {
    id: "ma-hmo",
    name: "MEDICARE ADVANTAGE HMO",
    type: "Medicare Advantage",
    description: "NETWORK-BASED PLAN WITH LOWER COSTS",
    premium: 0,
    deductible: 200,
    coinsurance: 0.1,
    coverageLimit: 4000,
    extras: ["Vision", "Dental", "Prescription drugs", "Fitness membership"],
    networkRestrictions: "Strict network requirements",
  },
];

function calculateIRMAA(yearlyIncome: number) {
  for (const bracket of INCOME_BRACKETS) {
    if (yearlyIncome <= bracket.max) {
      return bracket.additional;
    }
  }
  return INCOME_BRACKETS[INCOME_BRACKETS.length - 1].additional;
}

function calculateTotalPremium(basePremium: number, income: number) {
  const irmaa = calculateIRMAA(income);
  return basePremium + (irmaa || 0);
}

function calculateAnnualCost(planId: string, income: number, medicalExpenses: number) {
  const plan = AVAILABLE_PLANS.find((p) => p.id === planId)!;
  const annualPremium = calculateTotalPremium(plan.premium, income) * 12;

  let outOfPocket = 0;

  if (planId === "standard") {
    outOfPocket = Math.min(plan.deductible, medicalExpenses);
    if (medicalExpenses > plan.deductible && plan.coinsurance) {
      outOfPocket += (medicalExpenses - plan.deductible) * plan.coinsurance;
    }
  } else if (planId.startsWith("medigap")) {
    outOfPocket = STANDARD_DEDUCTIBLE;
    if (planId === "medigap-n") {
      const estimatedVisits = Math.floor(medicalExpenses / 150);
      outOfPocket += Math.min(estimatedVisits * 20, 200);
    }
  } else if (planId.startsWith("ma")) {
    outOfPocket = Math.min(plan.deductible, medicalExpenses);
    if (medicalExpenses > plan.deductible && plan.coinsurance) {
      const coinsuranceAmount = (medicalExpenses - plan.deductible) * plan.coinsurance;
      outOfPocket += Math.min(coinsuranceAmount, plan.coverageLimit! - plan.deductible);
    }
  }

  return {
    annualPremium,
    outOfPocket,
    totalAnnual: annualPremium + outOfPocket,
  };
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function MedicareRoute() {
  const [income, setIncome] = useState(90000);
  const [age, setAge] = useState(65);
  const [medicalExpenses, setMedicalExpenses] = useState(2000);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const togglePlanSelection = (planId: string) => {
    if (selectedPlans.includes(planId)) {
      setSelectedPlans(selectedPlans.filter((id) => id !== planId));
    } else {
      setSelectedPlans([...selectedPlans, planId]);
    }
  };

  const generateResults = () => {
    setShowResults(true);
    setActiveTab("results");
  };

  const irmaa = calculateIRMAA(income);

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
            MEDICARE COMPARISON
          </h1>
          <p className="text-white/70 text-sm">
            ANALYZE COSTS AND BENEFITS FOR 2024. INCOME THRESHOLD ${income.toLocaleString()} / YEAR.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-8 bg-white/5 border border-white/10">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              PROFILE
            </TabsTrigger>
            <TabsTrigger
              value="plans"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
            >
              PLANS
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/70"
              disabled={!showResults}
            >
              RESULTS
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-mono uppercase text-white/70 block mb-4">
                    AGE: {age}
                  </label>
                  <Slider
                    value={[age]}
                    onValueChange={(values) => setAge(values[0])}
                    min={65}
                    max={90}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>65</span>
                    <span>90</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-mono uppercase text-white/70 block mb-4">
                    ANNUAL INCOME: {formatCurrency(income)}
                  </label>
                  <Slider
                    value={[income]}
                    onValueChange={(values) => setIncome(values[0])}
                    min={30000}
                    max={500000}
                    step={5000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>$30,000</span>
                    <span>$500,000</span>
                  </div>
                  {irmaa > 0 && (
                    <div className="mt-4 p-3 border border-white/10 bg-white/5">
                      <p className="text-xs text-white/70">
                        IRMAA SURCHARGE: +{formatCurrency(irmaa)}/MONTH
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-mono uppercase text-white/70 block mb-4">
                    EXPECTED ANNUAL MEDICAL EXPENSES: {formatCurrency(medicalExpenses)}
                  </label>
                  <Slider
                    value={[medicalExpenses]}
                    onValueChange={(values) => setMedicalExpenses(values[0])}
                    min={0}
                    max={10000}
                    step={500}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-2">
                    <span>$0</span>
                    <span>$10,000</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setActiveTab("plans")}
                className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20 uppercase text-sm font-mono"
              >
                CONTINUE TO PLANS
              </Button>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans">
            <div className="space-y-6">
              {AVAILABLE_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-6 border ${
                    selectedPlans.includes(plan.id)
                      ? "border-white/30 bg-white/5"
                      : "border-white/10 bg-white/2"
                  } transition-colors`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-mono font-bold uppercase tracking-tight">
                        {plan.name}
                      </h3>
                      <Badge variant="outline" className="mt-2 uppercase text-xs">
                        {plan.type}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => togglePlanSelection(plan.id)}
                      className={`${
                        selectedPlans.includes(plan.id)
                          ? "bg-white text-black hover:bg-white/90"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      } uppercase text-sm font-mono`}
                    >
                      {selectedPlans.includes(plan.id) ? "SELECTED" : "COMPARE"}
                    </Button>
                  </div>

                  <p className="text-sm text-white/70 mb-6">{plan.description}</p>

                  <div className="grid grid-cols-2 gap-6 text-sm mb-6">
                    <div>
                      <p className="text-white/70 uppercase text-xs mb-2">MONTHLY PREMIUM</p>
                      <p className="text-white font-mono">
                        {formatCurrency(calculateTotalPremium(plan.premium, income))}
                      </p>
                      {irmaa > 0 && (
                        <p className="text-white/50 text-xs mt-1">
                          (BASE {formatCurrency(plan.premium)} + IRMAA {formatCurrency(irmaa)})
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-white/70 uppercase text-xs mb-2">ANNUAL DEDUCTIBLE</p>
                      <p className="text-white font-mono">{formatCurrency(plan.deductible)}</p>
                    </div>

                    <div>
                      <p className="text-white/70 uppercase text-xs mb-2">COINSURANCE</p>
                      <p className="text-white font-mono">
                        {plan.coinsurance ? `${(plan.coinsurance * 100).toFixed(0)}%` : "VARIES"}
                      </p>
                    </div>

                    <div>
                      <p className="text-white/70 uppercase text-xs mb-2">OUT-OF-POCKET MAX</p>
                      <p className="text-white font-mono">
                        {plan.coverageLimit ? formatCurrency(plan.coverageLimit) : "NONE"}
                      </p>
                    </div>
                  </div>

                  {plan.extras && plan.extras.length > 0 && (
                    <div>
                      <p className="text-white/70 uppercase text-xs mb-3">EXTRA BENEFITS</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.extras.map((extra) => (
                          <Badge key={extra} className="uppercase text-xs bg-white/10 text-white">
                            {extra}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.copays && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-white/70 uppercase text-xs mb-2">COPAYS</p>
                      <p className="text-white text-sm font-mono">{plan.copays}</p>
                    </div>
                  )}
                </div>
              ))}

              <Button
                onClick={generateResults}
                disabled={selectedPlans.length < 1}
                className="w-full bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed uppercase font-mono font-bold"
              >
                COMPARE SELECTED PLANS
              </Button>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results">
            {showResults && (
              <div className="space-y-8">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10 hover:bg-transparent">
                        <TableHead className="text-white/70 uppercase text-xs">PLAN</TableHead>
                        <TableHead className="text-white/70 uppercase text-xs text-right">
                          ANNUAL PREMIUM
                        </TableHead>
                        <TableHead className="text-white/70 uppercase text-xs text-right">
                          OUT-OF-POCKET
                        </TableHead>
                        <TableHead className="text-white/70 uppercase text-xs text-right">
                          TOTAL ANNUAL
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPlans.map((planId) => {
                        const plan = AVAILABLE_PLANS.find((p) => p.id === planId)!;
                        const costs = calculateAnnualCost(planId, income, medicalExpenses);

                        return (
                          <TableRow
                            key={planId}
                            className="border-b border-white/10 hover:bg-white/5"
                          >
                            <TableCell className="text-white font-mono text-sm py-4">
                              {plan.name}
                            </TableCell>
                            <TableCell className="text-white text-right font-mono text-sm py-4">
                              {formatCurrency(costs.annualPremium)}
                            </TableCell>
                            <TableCell className="text-white text-right font-mono text-sm py-4">
                              {formatCurrency(costs.outOfPocket)}
                            </TableCell>
                            <TableCell className="text-white text-right font-mono text-sm py-4 font-bold">
                              {formatCurrency(costs.totalAnnual)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="p-6 border border-white/10 bg-white/5">
                  <p className="text-sm font-mono uppercase text-white/70 mb-4">RECOMMENDATION</p>
                  {(() => {
                    const planCosts = selectedPlans
                      .map((planId) => {
                        const plan = AVAILABLE_PLANS.find((p) => p.id === planId)!;
                        return {
                          id: planId,
                          name: plan.name,
                          ...calculateAnnualCost(planId, income, medicalExpenses),
                        };
                      })
                      .sort((a, b) => a.totalAnnual - b.totalAnnual);

                    return (
                      <div className="text-white font-mono text-sm">
                        <p className="mb-2">
                          LOWEST COST: <span className="font-bold">{planCosts[0].name}</span>
                        </p>
                        <p>
                          ESTIMATED ANNUAL COST:{" "}
                          <span className="font-bold">
                            {formatCurrency(planCosts[0].totalAnnual)}
                          </span>
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 p-6 border-t border-white/10 text-sm text-white/70 space-y-2">
          <p className="uppercase font-mono text-xs">
            MEDICARE PART B {new Date().getFullYear()} STANDARD COSTS
          </p>
          <p>
            PREMIUM: {formatCurrency(STANDARD_PREMIUM)}/MONTH. DEDUCTIBLE:{" "}
            {formatCurrency(STANDARD_DEDUCTIBLE)} ANNUAL.
          </p>
          <p>
            IRMAA: INCOME-RELATED MONTHLY ADJUSTMENT AMOUNT APPLIES ABOVE {formatCurrency(103000)}{" "}
            ANNUALLY.
          </p>
          <p>
            ORIGINAL MEDICARE COVERS DOCTOR VISITS, OUTPATIENT CARE, PREVENTIVE SERVICES. COVERAGE
            OPTIONS INCLUDE MEDIGAP SUPPLEMENTAL PLANS OR MEDICARE ADVANTAGE BUNDLED PLANS.
          </p>
        </div>
      </div>
    </div>
  );
}
