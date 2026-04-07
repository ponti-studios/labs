const users = []
const accounts = []
const payments = []

class User {
  private id: number;
  public account: Account;

  constructor(balance?: number) {
    this.id = users.length;
    users.push(this);

    this.account = new Account(this.id, balance);
  }

  withdrawal(amount: number, otherAcct: Account) {
    this.account.withdrawal(amount, otherAcct)
  }

  deposit(amount: number, otherAcct: Account) {
    this.account.deposit(amount, otherAcct)
  }
}

class Admin {
  transfer(acct: Account, acct2: Account, amount: number) {
    const payment = new Payment(acct, acct2, amount)
  }
}

class Payment {
  private id: number;
  private fromAcct: string;
  private toAcct: string;

  constructor(acct: Account, acct2: Account, amount: number) {
    acct.withdrawal(amount, acct2)
      .then(() => acct2.deposit(amount, acct))
      .catch(err => console.log(err));

    this.id = payments.length;
    this.fromAcct = acct + '_from';
    this.toAcct = acct2 + '_to';

    payments.push(this)
  }
}

class Account {
  private myId: number;
  private balance: number = 0;
  private userId: number;

  constructor(userId: number, balance: number) {
    this.userId = userId;
    this.balance = balance || 0;
    this.myId = accounts.length;
    accounts.push(this)
  }

  async withdrawal(amount: number, otherAcct: Account) {
    const type = 'WITHDRAWAL'
    if (this.balance < amount) return new Error('No more money')
    this.balance -= amount
    console.log(type, amount, otherAcct.myId, this.myId, otherAcct.balance, this.balance)
    return this
  }

  async deposit(amount: number, otherAcct: Account) {
    const type = 'DEPOSIT'
    this.balance += amount
    console.log(type, amount, this.myId, otherAcct.myId, this.balance, otherAcct.balance)
    return this
  }
}

const admin = new Admin()

const user1 = new User()
const user2 = new User()

user1.deposit(50, user2.account);
user2.deposit(50 , user1.account);

user1.withdrawal(20, user2.account);
user2.withdrawal(30, user1.account);

admin.transfer(user1.account, user2.account, 10);
