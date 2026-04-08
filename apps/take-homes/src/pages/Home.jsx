export default function Home() {
  return (
    <div>
      <h2>Welcome</h2>
      <p>A collection of take-home coding tests I've completed for various companies.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <a href="/cards" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Cards (Luck of the Draw)</h3>
          <p>React card game - deal hands and track winners</p>
        </a>
        <a href="/kensho" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Kensho</h3>
          <p>Contacts table with sorting and filtering</p>
        </a>
        <a href="/quilt" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Quilt</h3>
          <p>Form builder with dynamic fields</p>
        </a>
        <a href="/cloudmargin" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>CloudMargin</h3>
          <p>Accrual calculator for financial contracts</p>
        </a>
        <a href="/red-badger" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Red Badger</h3>
          <p>Robot planet Mars simulation</p>
        </a>
        <a href="/goldman-sachs" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Goldman Sachs</h3>
          <p>Algorithm challenges - fee calculation & prime generator</p>
        </a>
        <a href="/growth-street" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Growth Street</h3>
          <p>Banking system with async transfers</p>
        </a>
        <a href="/vendigo" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Vendigo</h3>
          <p>Book shop with search functionality</p>
        </a>
        <a href="/peterson-academy" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Peterson Academy</h3>
          <p>Image carousel with staggered layout</p>
        </a>
        <a href="/interview-cake" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Interview Cake</h3>
          <p>Closure scope demo - classic interview question</p>
        </a>
        <a href="/algorithms" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Algorithms</h3>
          <p>Sorting, searching, recursion & data structures</p>
        </a>
        <a href="/click-therapeutics" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Click Therapeutics</h3>
          <p>Vote counting & leaderboard algorithm</p>
        </a>
        <a href="/chart-hop" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>ChartHop</h3>
          <p>Group anagrams together</p>
        </a>
        <a href="/daily-mail" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3>Daily Mail</h3>
          <p>Character map, closure function & graph connectivity</p>
        </a>
      </div>
    </div>
  )
}