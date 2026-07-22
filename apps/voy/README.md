# Medication Pen Duration Calculator - Coding Test

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start both API server and React Native Web UI
npm start
```

This will:
- Start the API server at `http://localhost:3000`
- Start the React Native Web UI at `http://localhost:8080` (opens automatically)

```bash
# 3. In a new terminal, run tests
npm test
```

---

## Problem Statement

You work for a healthcare company that provides medication pens to patients. Each pen contains **100mg** of medication when full. Patients use varying amounts of medication each week based on their prescription.

Your task is to write a function that calculates **how many weeks** a single pen will last given the weekly dosage amounts.

---

## Phase 1: Core Function Implementation

### Task

Implement the `calculatePenDuration(weeklyDosages)` function in [solution.js](solution.js).

### Requirements

- Takes an array of numbers representing the mg used each week
- Returns the total number of weeks the pen will last (as a number)
- The pen starts with 100mg
- If the pen doesn't have enough medication for a full weekly dose, count it as a partial week


### Testing

Run `npm test` to verify your implementation. 

---

## Phase 2: React Integration

### Task

Build a React based UI, where the medication information is pulled from a remote service;

### Requirements

1. **Getting weekly dosage**
   - Make HTTP GET request to `http://localhost:3000/api/medication-schedule`
   - Extract the `weeklyDosages` array from the response

2. **Complete React component integration:**
   - Match the design shown in [example-layout.png](example-layout.png)
   - Re use the function from Phase 1, showing total weeks in the UI
   - Use the response from the API to render each week in the UI

### API Endpoint

**GET http://localhost:3000/api/medication-schedule**

Returns:
```json
{
  "weeklyDosages": [25, 30, 20, 35],
  "penCapacity": 100,
  "description": "Weekly medication dosages in mg"
}
```

---

## What We're Looking For

**Phase 1:**
- Correct iteration and accumulation logic
- Proper partial week calculation
- Clean, readable code
- All tests passing

**Phase 2:**
- Successful API integration
- UI displays data from API correctly
- Clean component structure

Good luck!
