import json
import uuid
from typing import Dict, List
from uuid import UUID

from flask import Flask

app = Flask(__name__)


class Database:
    accounts: Dict
    customers: Dict

    def __init__(self):
        self.accounts = {}
        self.customers = {}

    def drop_all(self):
        self.accounts = {}
        self.customers = {}


database = Database()


class Account:
    id: UUID
    name: str
    type: str
    account_number: str
    routing_number: str
    customer: str
    balance: int

    def __init__(self, *args, account_type: str, customer: str, name: str = None):
        self.name = name
        self.customer = customer
        self.balance = 0
        self.account_type = account_type
        self.id = uuid.uuid1()
        self.account_number = uuid.uuid1()
        self.routing_number = uuid.uuid1()


class Customer:
    id: UUID
    name: str
    accounts: List[Account]

    def __init__(self, *args, name: str):
        self.id: UUID = uuid.uuid1()
        self.name: str = name
        self.accounts: List[Account] = []

    def open_account(self, account_type, name) -> Account:
        account = Account(account_type=account_type, customer=self.id, name=name)
        database.accounts[account.id.hex] = account
        self.accounts.append(account.id.hex)
        return account

    def deposit_money(self, amount: int, account_id: str) -> None:
        """
        :param amount: Amount to deposit
        :type amount: int
        """
        account: Account = database.accounts[account_id]
        if account is not None:
            database.accounts[account_id].balance += amount


class Bank:
    name: str
    accounts: List[Account]
    customers: List[Customer]

    def __init__(self, *args, name: str):
        self.name = name
        self.accounts = []
        self.customers = []

    def add_customer(self, customer: Customer) -> Customer:
        id = customer.id.hex
        database.customers[id] = customer
        return customer

    def remove_customer(self, customer: Customer) -> [Customer]:
        id = customer.id.hex

        if database.customers[id] is not None:
            database.customers.pop(id)


@app.route("/")
def index():
    return json.dumps({"data": {"message": "Howdy Rowdy!"}})


if __name__ == "__main__":
    app.run()
