import { Badge, Button } from "@pontistudios/ui/primitives";
import { Slider } from "@pontistudios/ui/forms";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@pontistudios/ui/data-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pontistudios/ui/navigation";
import { useReducer } from "react";

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

type MedicareState = {
  income: number;
  age: number;
  medicalExpenses: number;
  selectedPlans: string[];
  showResults: boolean;
  activeTab: string;
};

type MedicareAction =
  | { type: "set_income"; value: number }
  | { type: "set_age"; value: number }
  | { type: "set_medical_expenses"; value: number }
  | { type: "toggle_plan"; planId: string }
  | { type: "generate_results" }
  | { type: "set_tab"; tab: string };

function medicareReducer(state: MedicareState, action: MedicareAction): MedicareState {
  switch (action.type) {
    case "set_income":
      return { ...state, income: action.value };
    case "set_age":
      return { ...state, age: action.value };
    case "set_medical_expenses":
      return { ...state, medicalExpenses: action.value };
    case "toggle_plan":
      return {
        ...state,
        selectedPlans: state.selectedPlans.includes(action.planId)
          ? state.selectedPlans.filter((id) => id !== action.planId)
          : [...state.selectedPlans, action.planId],
      };
    case "generate_results":
      return { ...state, showResults: true, activeTab: "results" };
    case "set_tab":
      return { ...state, activeTab: action.tab };
  }
}

const initialMedicareState: MedicareState = {
  income: 90000,
  age: 65,
  medicalExpenses: 2000,
  selectedPlans: [],
  showResults: false,
  activeTab: "profile",
};

export default function MedicareRoute() {
  const [{ income, age, medicalExpenses, selectedPlans, showResults, activeTab }, dispatch] =
    useReducer(medicareReducer, initialMedicareState);

  const togglePlanSelection = (planId: string) => dispatch({ type: "toggle_plan", planId });
  const generateResults = () => dispatch({ type: "generate_results" });

  const irmaa = calculateIRMAA(income);

  return (
    <div className="min-h-screen cursor-crosshair bg-black font-mono text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden font-mono text-xs leading-none whitespace-pre text-white/10 opacity-10">
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
        <div className="mb-12 border-b border-white/10 pb-8">
          <h1 className="mb-2">MEDICARE COMPARISON</h1>
          <p className="text-sm text-white/70">
            ANALYZE COSTS AND BENEFITS FOR 2024. INCOME THRESHOLD ${income.toLocaleString()} / YEAR.
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(tab) => dispatch({ type: "set_tab", tab })}
          className="w-full"
        >
          <TabsList className="mb-8 grid w-full grid-cols-3 border border-white/10 bg-white/5">
            <TabsTrigger
              value="profile"
              className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              PROFILE
            </TabsTrigger>
            <TabsTrigger
              value="plans"
              className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              PLANS
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="text-white/70 data-[state=active]:bg-white/10 data-[state=active]:text-white"
              disabled={!showResults}
            >
              RESULTS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="mb-4 block font-mono text-sm text-white/70 uppercase">
                    AGE: {age}
                  </label>
                  <Slider
                    value={[age]}
                    onValueChange={(values) => dispatch({ type: "set_age", value: values[0] })}
                    min={65}
                    max={90}
                    step={1}
                    className="w-full"
                  />
                  <div className="mt-2 flex justify-between text-xs text-white/50">
                    <span>65</span>
                    <span>90</span>
                  </div>
                </div>

                <div>
                  <label className="mb-4 block font-mono text-sm text-white/70 uppercase">
                    ANNUAL INCOME: {formatCurrency(income)}
                  </label>
                  <Slider
                    value={[income]}
                    onValueChange={(values) => dispatch({ type: "set_income", value: values[0] })}
                    min={30000}
                    max={500000}
                    step={5000}
                    className="w-full"
                  />
                  <div className="mt-2 flex justify-between text-xs text-white/50">
                    <span>$30,000</span>
                    <span>$500,000</span>
                  </div>
                  {irmaa > 0 && (
                    <div className="mt-4 border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-white/70">
                        IRMAA SURCHARGE: +{formatCurrency(irmaa)}/MONTH
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-4 block font-mono text-sm text-white/70 uppercase">
                    EXPECTED ANNUAL MEDICAL EXPENSES: {formatCurrency(medicalExpenses)}
                  </label>
                  <Slider
                    value={[medicalExpenses]}
                    onValueChange={(values) =>
                      dispatch({ type: "set_medical_expenses", value: values[0] })
                    }
                    min={0}
                    max={10000}
                    step={500}
                    className="w-full"
                  />
                  <div className="mt-2 flex justify-between text-xs text-white/50">
                    <span>$0</span>
                    <span>$10,000</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => dispatch({ type: "set_tab", tab: "plans" })}
                className="w-full border border-white/20 bg-white/10 font-mono text-sm text-white uppercase hover:bg-white/20"
              >
                CONTINUE TO PLANS
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="plans">
            <div className="space-y-6">
              {AVAILABLE_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`border p-6 ${selectedPlans.includes(plan.id) ? "border-white/30 bg-white/5" : "border-white/10 bg-white/2"} transition-colors`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3>{plan.name}</h3>
                      <Badge variant="outline" className="mt-2 text-xs uppercase">
                        {plan.type}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => togglePlanSelection(plan.id)}
                      className={`${selectedPlans.includes(plan.id) ? "bg-white text-black hover:bg-white/90" : "border border-white/20 bg-white/10 text-white hover:bg-white/20"} font-mono text-sm uppercase`}
                    >
                      {selectedPlans.includes(plan.id) ? "SELECTED" : "COMPARE"}
                    </Button>
                  </div>

                  <p className="mb-6 text-sm text-white/70">{plan.description}</p>

                  <div className="mb-6 grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="mb-2 text-xs text-white/70 uppercase">MONTHLY PREMIUM</p>
                      <p className="font-mono text-white">
                        {formatCurrency(calculateTotalPremium(plan.premium, income))}
                      </p>
                      {irmaa > 0 && (
                        <p className="mt-1 text-xs text-white/50">
                          (BASE {formatCurrency(plan.premium)} + IRMAA {formatCurrency(irmaa)})
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="mb-2 text-xs text-white/70 uppercase">ANNUAL DEDUCTIBLE</p>
                      <p className="font-mono text-white">{formatCurrency(plan.deductible)}</p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs text-white/70 uppercase">COINSURANCE</p>
                      <p className="font-mono text-white">
                        {plan.coinsurance ? `${(plan.coinsurance * 100).toFixed(0)}%` : "VARIES"}
                      </p>
                    </div>

                    <div>
                      <p className="mb-2 text-xs text-white/70 uppercase">OUT-OF-POCKET MAX</p>
                      <p className="font-mono text-white">
                        {plan.coverageLimit ? formatCurrency(plan.coverageLimit) : "NONE"}
                      </p>
                    </div>
                  </div>

                  {plan.extras && plan.extras.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs text-white/70 uppercase">EXTRA BENEFITS</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.extras.map((extra) => (
                          <Badge key={extra} className="bg-white/10 text-xs text-white uppercase">
                            {extra}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.copays && (
                    <div className="mt-4 border-t border-white/10 pt-4">
                      <p className="mb-2 text-xs text-white/70 uppercase">COPAYS</p>
                      <p className="font-mono text-sm text-white">{plan.copays}</p>
                    </div>
                  )}
                </div>
              ))}

              <Button
                onClick={generateResults}
                disabled={selectedPlans.length < 1}
                className="w-full bg-white font-mono font-bold text-black uppercase hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                COMPARE SELECTED PLANS
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results">
            {showResults && (
              <div className="space-y-8">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-white/10 hover:bg-transparent">
                        <TableHead className="text-xs text-white/70 uppercase">PLAN</TableHead>
                        <TableHead className="text-right text-xs text-white/70 uppercase">
                          ANNUAL PREMIUM
                        </TableHead>
                        <TableHead className="text-right text-xs text-white/70 uppercase">
                          OUT-OF-POCKET
                        </TableHead>
                        <TableHead className="text-right text-xs text-white/70 uppercase">
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
                            <TableCell className="py-4 font-mono text-sm text-white">
                              {plan.name}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono text-sm text-white">
                              {formatCurrency(costs.annualPremium)}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono text-sm text-white">
                              {formatCurrency(costs.outOfPocket)}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono text-sm font-bold text-white">
                              {formatCurrency(costs.totalAnnual)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="border border-white/10 bg-white/5 p-6">
                  <p className="mb-4 font-mono text-sm text-white/70 uppercase">RECOMMENDATION</p>
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
                      <div className="font-mono text-sm text-white">
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

        <div className="mt-16 space-y-2 border-t border-white/10 p-6 text-sm text-white/70">
          <p className="font-mono text-xs uppercase">
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
