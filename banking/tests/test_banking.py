import os

import pytest

from misc import Account, Bank, Customer, database

BANK_NAME = "Chase Bank"
ACCOUNT_TYPE = "checking"


@pytest.fixture
def bank():
    return Bank(name=BANK_NAME)


@pytest.fixture
def customer(bank: Bank, scope="module"):
    customer = Customer(name="Charles Ponti")
    bank.add_customer(customer)
    yield customer


@pytest.fixture
def account(customer: Customer):
    return customer.open_account(ACCOUNT_TYPE, "my_checking_account")


def test_db(bank: Bank, customer: Customer, account: Account):
    assert len(database.customers) == 1
    assert len(database.accounts) == 1

    customer.open_account(ACCOUNT_TYPE, "my_checking_account")
    assert len(database.accounts) == 2

    database.drop_all()
    assert database.customers == {}
    assert database.accounts == {}


def test_bank(bank):
    assert bank.name == BANK_NAME
    assert bank.customers == []
    assert bank.accounts == []


def test_bank_add_customer(bank, customer: Customer):
    bank_customer = bank.add_customer(customer)
    assert database.customers[bank_customer.id.hex].name == customer.name


def test_bank_remove_customer(bank: Bank, customer: Customer):
    database.drop_all()
    customer: Customer = bank.add_customer(customer)
    assert len(database.customers) == 1
    bank.remove_customer(customer)
    assert len(database.customers) == 0


def test_account(account, customer):
    assert account.balance == 0
    assert account.customer == customer.id


def test_customer(customer):
    assert customer.accounts == []


def test_open_account(customer: Customer):
    account = customer.open_account(ACCOUNT_TYPE, "my_account")
    assert database.accounts[account.id.hex].customer == customer.id


def test_customer_deposit_money(customer: Customer):
    account = customer.open_account(ACCOUNT_TYPE, "my_account")
    customer.deposit_money(1500, account.id.hex)
    assert database.accounts[account.id.hex].balance == 1500
