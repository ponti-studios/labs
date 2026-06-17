# Closure Scope in Loops

*Courtesy of Interview Cake*

Why every button in a `var` loop shows the wrong prize — and four ways to fix it.

---

## The problem

You have an array of prizes and you want to render a button for each one. The natural impulse is a `for` loop. Each click handler closes over the loop variable `i`, so you expect button 1 to show prize 1, button 2 to show prize 2, and so on. Instead, every button shows `undefined`.

```tsx
const prizes = ["A Unicorn!", "A Hug!", "Fresh Laundry!"];
const buttons = [];

for (var i = 0; i < prizes.length; i++) {
  buttons.push(
    <button onClick={() => alert(prizes[i])}>
      Button {i + 1}
    </button>
  );
}

// Click any button → "undefined"
// By the time you click, i === 3, and prizes[3] doesn't exist.
```

---

## Why it breaks

`var` is function-scoped, not block-scoped. The `for` loop does not create a fresh binding for `i` on each iteration — there is exactly *one* `i` in the enclosing function scope, and every closure references it.

Click handlers are asynchronous. By the time the user clicks a button, the loop has long since finished. At that point `i === 3`, and `prizes[3]` is `undefined`. All three handlers read the same stale value.

```ts
// var is function-scoped, not block-scoped.
// The loop does not create a new binding for i on each iteration —
// there is exactly ONE i shared by every closure.

// After the loop:
//   i === 3
//   prizes[3] === undefined

// All three handlers close over the same i, so they all read 3.
```

---

## Fix 1 — `let`

The simplest fix is to replace `var` with `let`. Unlike `var`, `let` is block-scoped: the JavaScript engine creates a new binding for `i` on every iteration of the loop. Each closure captures its own independent copy.

```tsx
for (let i = 0; i < prizes.length; i++) {
  buttons.push(
    <button onClick={() => alert(prizes[i])}>
      Button {i + 1}
    </button>
  );
}
// Each closure captures a distinct i: 0, 1, 2.
```

---

## Fix 2 — IIFE (ES5 pattern)

Before `let` existed, the canonical solution was an immediately-invoked function expression. Calling a function with `i` as an argument creates a new scope and captures the current value by passing it — not referencing it.

```tsx
for (var i = 0; i < prizes.length; i++) {
  buttons.push(
    (function(index) {
      return <button onClick={() => alert(prizes[index])}>
        Button {index + 1}
      </button>;
    })(i)
  );
}
```

---

## Fix 3 — data attribute

A third approach sidesteps closures entirely. Store the index in the DOM via a data attribute and read it back at click time. The handler never closes over any loop variable — it reads from the element itself, which always holds the right value.

```tsx
prizes.map((_, index) => (
  <button
    data-index={index}
    onClick={(e) => {
      const i = parseInt(e.currentTarget.dataset.index, 10);
      alert(prizes[i]);
    }}
  >
    Button {index + 1}
  </button>
))
```

---

## Fix 4 — `Array.map` (React idiom)

In React, you rarely need a `for` loop to render a list. `Array.map` passes each element and its index as fresh function parameters on every call. There is no shared variable — the problem simply cannot arise.

```tsx
prizes.map((prize, index) => (
  <button onClick={() => alert(prize)}>
    Button {index + 1}
  </button>
))
```

---

## Which fix to use

In modern JavaScript, prefer `let` or `Array.map` — they express the intent most clearly. The IIFE pattern is still worth knowing because you will encounter it in older codebases. The data attribute approach is occasionally useful when you need to handle events on dynamically created DOM elements outside React's control.

The root lesson is that closures capture *references*, not values. Whenever a callback reaches into the outer scope, ask: by the time this runs, what will that variable hold? If the answer is "it might have changed", you need one of the fixes above.
