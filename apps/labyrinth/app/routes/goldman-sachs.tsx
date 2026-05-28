import { useState, type JSX } from "react";

type ActiveTab = "bank" | "prime";
type FeeChoice = "upfront" | "fee";

interface BankResult {
  n: number;
  k: number;
  x: number;
  d: number;
  p: number[];
  result: FeeChoice;
}

function feeOrUpfront(
  numOfPayments: number,
  basePayment: number,
  percentage: number,
  upfront: number,
  payments: number[],
): FeeChoice {
  const feeTotal = payments.slice(0, numOfPayments).reduce((total, payment) => {
    const paymentPercentage = payment * (percentage / 100);
    return total + (paymentPercentage >= basePayment ? paymentPercentage : basePayment);
  }, 0);

  return upfront < feeTotal ? "upfront" : "fee";
}

function isPrime(value: number): boolean {
  if (value < 2) {
    return false;
  }

  for (let divisor = 2; divisor <= Math.sqrt(value); divisor += 1) {
    if (value % divisor === 0) {
      return false;
    }
  }

  return true;
}

function* countdownGenerator(start: number): Generator<number, void, void> {
  for (let value = start - 1; value > 1; value -= 1) {
    if (isPrime(value)) {
      yield value;
    }
  }
}

export default function GoldmanSachs(): JSX.Element {
  const [activeTab, setActiveTab] = useState<ActiveTab>("bank");
  const [bankResult, setBankResult] = useState<BankResult | null>(null);
  const [primeResult, setPrimeResult] = useState<number[]>([]);

  const runBankExample = (): void => {
    const bankExample = {
      n: 4,
      k: 2,
      x: 10,
      d: 100,
      p: [100, 200, 300, 400],
    };

    setBankResult({
      ...bankExample,
      result: feeOrUpfront(
        bankExample.n,
        bankExample.k,
        bankExample.x,
        bankExample.d,
        bankExample.p,
      ),
    });
  };

  const runPrimeGenerator = (): void => {
    const generator = countdownGenerator(10);
    const generatedPrimes: number[] = [];

    for (const prime of generator) {
      generatedPrimes.push(prime);
    }

    setPrimeResult(generatedPrimes);
  };

  return (
    <div>
      <h2>Goldman Sachs</h2>
      <p>JavaScript algorithm challenges from Goldman Sachs interviews.</p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setActiveTab("bank")}
          className={`btn ${activeTab === "bank" ? "btn-primary" : ""}`}
        >
          Bank Accounts
        </button>
        <button
          onClick={() => setActiveTab("prime")}
          className={`btn ${activeTab === "prime" ? "btn-primary" : ""}`}
        >
          Prime Countdown
        </button>
      </div>

      {activeTab === "bank" ? (
        <div className="card">
          <h3>Fee or Upfront</h3>
          <p>
            Given loan parameters, determine if an upfront fee or percentage-based fee is better.
          </p>

          <div
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            <p>
              <strong>Example Input:</strong>
            </p>
            <p>n=4 (payments), k=2 (base payment), x=10%, d=100 (upfront)</p>
            <p>payments: [100, 200, 300, 400]</p>
          </div>

          <button onClick={runBankExample} className="btn btn-primary">
            Run Algorithm
          </button>

          {bankResult !== null && (
            <div style={{ marginTop: "1rem" }}>
              <p>
                <strong>Result:</strong>{" "}
                {bankResult.result === "upfront" ? "Take the upfront!" : "Pay fee based"}
              </p>
              <p>
                Calculate: For each payment, charge max(basePayment, payment * {bankResult.x}%)
              </p>
              <p>Compare total fees against upfront of {bankResult.d}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <h3>Prime Number Countdown Generator</h3>
          <p>Generate prime numbers in descending order from n-1 down to 2.</p>

          <div
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              borderRadius: "4px",
              marginBottom: "1rem",
            }}
          >
            <p>
              <strong>n = 10</strong>
            </p>
            <p>Primes below 10: 7, 5, 3, 2</p>
          </div>

          <button onClick={runPrimeGenerator} className="btn btn-primary">
            Generate Primes
          </button>

          {primeResult.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <p>
                <strong>Output:</strong> [{primeResult.join(", ")}]
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}