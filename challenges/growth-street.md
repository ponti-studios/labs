# Async Banking System

*Courtesy of Growth Street*

Designing a `User` / `Account` / `Admin` model for financial operations — and the concurrency problems that emerge the moment you make it async.

---

## The class structure

The challenge specifies four entities. The separation of concerns is deliberate: `Account` owns the balance and the mutation logic. `User` owns identity and delegates to accounts. `Admin` coordinates multi-account operations. `Payment` is an immutable record of a completed transfer.

```ts
class Account {
  balance: number = 0;

  async deposit(amount: number): Promise<void> {
    await delay(10);
    this.balance += amount;
  }

  async withdraw(amount: number): Promise<void> {
    if (this.balance < amount) throw new Error("Insufficient funds");
    await delay(10);
    this.balance -= amount;
  }
}

class User {
  account = new Account();
  constructor(public name: string) {}

  deposit(amount: number, target: Account) {
    return target.deposit(amount);
  }

  withdraw(amount: number, source: Account) {
    return source.withdraw(amount);
  }
}

class Payment {
  constructor(
    public from: Account,
    public to: Account,
    public amount: number,
    public timestamp = Date.now(),
  ) {}
}

class Admin {
  payments: Payment[] = [];

  async transfer(from: Account, to: Account, amount: number): Promise<Payment> {
    await from.withdraw(amount);
    await to.deposit(amount);
    const payment = new Payment(from, to, amount);
    this.payments.push(payment);
    return payment;
  }
}
```

---

## Why async?

In a production banking system, account balances live in a database, not in memory. Every deposit and withdrawal is a network round-trip — an inherently async operation. Modelling this with `async/await` from the start means the interface is honest: callers know they are waiting for I/O, and they can handle failures.

The problem is that "honest about being async" also means "honest about concurrency" — and concurrent mutations on shared state produce race conditions.

---

## The race condition

Consider two withdrawals submitted at the same time. Each reads the current balance, both see enough funds to proceed, and both apply their deduction. The balance goes negative even though either withdrawal alone would have been rejected.

```ts
const account = new Account();
account.balance = 100;

// Both read balance === 100 before either write completes.
const w1 = account.withdraw(80); // sees 100, proceeds
const w2 = account.withdraw(80); // also sees 100, also proceeds

await Promise.all([w1, w2]);

console.log(account.balance); // -60
```

This is the classic read-modify-write hazard. The check and the write are not atomic — another operation can slip in between them.

---

## The transfer problem

Transfers expose a related problem: atomicity across two accounts. A transfer is a withdrawal from one account followed by a deposit into another. If anything goes wrong between those two steps — a crash, a network timeout, a thrown exception — money disappears.

```ts
// The naive transfer is not atomic — it's two separate async operations.
async transfer(from: Account, to: Account, amount: number) {
  await from.withdraw(amount);  // ← crash here: money gone from 'from',
  await to.deposit(amount);     //   never arrives in 'to'
}

// A real system handles this with a database transaction:
//   BEGIN TRANSACTION
//     UPDATE accounts SET balance = balance - amount WHERE id = from_id
//     UPDATE accounts SET balance = balance + amount WHERE id = to_id
//   COMMIT
// Both updates succeed together or neither does.
```

Real systems solve this with database transactions — both updates are wrapped in a single all-or-nothing operation. Without a database in this take-home, the honest answer is to acknowledge the limitation and document the assumption.

---

## Mitigating the race with optimistic locking

Without true transactions, a pragmatic mitigation is to push the invariant check inside the write itself — as close to the mutation as possible — and treat a failed check as an error the caller must handle. This narrows the race window but does not eliminate it.

```ts
async withdraw(amount: number): Promise<void> {
  // Simulate an atomic compare-and-swap:
  //   UPDATE accounts
  //   SET balance = balance - amount
  //   WHERE id = ? AND balance >= amount
  // If the row is not updated (rowCount === 0), throw.
  if (this.balance < amount) throw new Error("Insufficient funds");
  this.balance -= amount;
}
```

The takeaway: async I/O and shared mutable state are a dangerous combination. The class structure of this challenge is straightforward. The interesting engineering is in the concurrency model — and the honest answer in an interview is knowing where the gaps are, not pretending they don't exist.
