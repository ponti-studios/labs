# Accrual calculator

The purpose of this test is to build an API-based accrual calculator.

## Principles and definitions

A *balance* is the amount of money held on an account at a given date.

A *rate* is a value that is used to calculate the accrual, it can also change every day.

An *accrual* is the amount of interest generated for a given day. It is calculated by multiplying the daily balance with the daily rate. 

A *statement* is the sum of all accruals from and to specific dates (usually months). An adjustment can be applied on top of that sum and alter the total.

An *accrual* has a *date*, a *balance*, a *rate* and an *accrual* .

A *statement* has a *start_date*, an *end_date*, a *total* and an *adjustment*.

## The project

An end-user must be able to use the API (or a simple UI) to:
- Insert new accruals by date, balance and rate. The accrual is then calculated.
- Amend existing accruals (balance or rate). The accrual is then calculated.
- Retrieve statements
- Amend statements (change the total by supplying an adjustment).

When an accrual is inserted/updated, the underlying statement's total must be re-calculated.

## You will find in this repo

- A package.json file with ExpressJS installed
- A shortcut (npm run test) to run jasmine against a /test folder
- A data folder with sample data in JSON format

## Instructions

- Your code must be pushed to the GIT repository
- After 3h, your push access to the repository will be revoked
- The API **must** be built using ExpressJS
- The data structure (statements and accruals) provided in /data cannot be changed, however you **can** add more records to those files or setup a persistent DB with the technology of your choice.
- Test first, code second
- **DRY**