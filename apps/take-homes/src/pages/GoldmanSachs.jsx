import { useState } from 'react'

function feeOrUpfront(numOfPayments, basePayment, percentage, upfront, payments) {
  const withPercentage = payments.reduce((a, p) => {
    const pPercent = p * (percentage / 100)
    return a + (pPercent >= basePayment ? pPercent : basePayment)
  }, 0)

  return upfront < withPercentage ? 'upfront' : 'fee'
}

export default function GoldmanSachs() {
  const [activeTab, setActiveTab] = useState('bank')
  const [bankResult, setBankResult] = useState(null)
  const [primeResult, setPrimeResult] = useState([])

  const runBankExample = () => {
    const n = 4, k = 2, x = 10, d = 100
    const p = [100, 200, 300, 400]
    const result = feeOrUpfront(n, k, x, d, p)
    setBankResult({ n, k, x, d, p, result })
  }

  const runPrimeGenerator = () => {
    const isPrime = (n) => {
      for (let i = n - 1; i > 1; i--) {
        if (n % i === 0) return false
      }
      return true
    }

    const countdownGenerator = function* (n) {
      for (let i = n - 1; i > 1; i--) {
        if (isPrime(i)) yield i
      }
    }

    const gen = countdownGenerator(10)
    const results = []
    let val
    while ((val = gen.next().value) !== undefined) {
      results.push(val)
    }
    setPrimeResult(results)
  }

  return (
    <div>
      <h2>Goldman Sachs</h2>
      <p>JavaScript algorithm challenges from Goldman Sachs interviews.</p>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button onClick={() => setActiveTab('bank')} className={`btn ${activeTab === 'bank' ? 'btn-primary' : ''}`}>Bank Accounts</button>
        <button onClick={() => setActiveTab('prime')} className={`btn ${activeTab === 'prime' ? 'btn-primary' : ''}`}>Prime Countdown</button>
      </div>

      {activeTab === 'bank' ? (
        <div className="card">
          <h3>Fee or Upfront</h3>
          <p>Given loan parameters, determine if an upfront fee or percentage-based fee is better.</p>
          
          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <p><strong>Example Input:</strong></p>
            <p>n=4 (payments), k=2 (base payment), x=10%, d=100 (upfront)</p>
            <p>payments: [100, 200, 300, 400]</p>
          </div>

          <button onClick={runBankExample} className="btn btn-primary">Run Algorithm</button>

          {bankResult && (
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Result:</strong> {bankResult.result === 'upfront' ? 'Take the upfront!' : 'Pay fee based'}</p>
              <p>Calculate: For each payment, charge max(basePayment, payment * {bankResult.x}%)</p>
              <p>Compare total fees against upfront of {bankResult.d}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <h3>Prime Number Countdown Generator</h3>
          <p>Generate prime numbers in descending order from n-1 down to 2.</p>
          
          <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <p><strong>n = 10</strong></p>
            <p>Primes below 10: 7, 5, 3, 2</p>
          </div>

          <button onClick={runPrimeGenerator} className="btn btn-primary">Generate Primes</button>

          {primeResult.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Output:</strong> [{primeResult.join(', ')}]</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}