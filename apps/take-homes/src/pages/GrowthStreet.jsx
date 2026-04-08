export default function GrowthStreet() {
  return (
    <div>
      <h2>Growth Street - Banking System</h2>
      <p>A simple banking system with User, Account, Admin, and Payment classes demonstrating async transfer operations.</p>
      
      <div className="card">
        <h3>Class Structure</h3>
        <ul style={{ textAlign: 'left' }}>
          <li><strong>User</strong> - Has an account, can deposit/withdraw</li>
          <li><strong>Account</strong> - Holds balance, async deposit/withdrawal</li>
          <li><strong>Admin</strong> - Can transfer between accounts</li>
          <li><strong>Payment</strong> - Records transfers between accounts</li>
        </ul>
      </div>

      <div className="card">
        <h3>Code Example</h3>
        <pre style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', overflow: 'auto' }}>
{`const user1 = new User()
const user2 = new User()

user1.deposit(50, user2.account)
user2.deposit(50, user1.account)

user1.withdrawal(20, user2.account)
user2.withdrawal(30, user1.account)

admin.transfer(user1.account, user2.account, 10)`}
        </pre>
      </div>
    </div>
  )
}