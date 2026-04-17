# Lesson 3: Functions & Control Flow

## Functions

Functions are declared with `fn`. The last expression in a function is its return value.

```rust
fn main() {
    let result = add(5, 10);
    println!("Result: {}", result);
}

fn add(a: i32, b: i32) -> i32 {
    a + b  // no semicolon = return value
}

// Or with explicit return
fn add_explicit(a: i32, b: i32) -> i32 {
    return a + b;
}
```

## Control Flow

### if/else
```rust
let n = 5;

if n < 10 {
    println!("small");
} else if n < 100 {
    println!("medium");
} else {
    println!("big");
}

// as expression
let x = if true { 5 } else { 10 };
```

### match (Pattern Matching)
```rust
let x = 1;

match x {
    1 => println!("one"),
    2 => println!("two"),
    3 | 4 => println!("three or four"),
    _ => println!("something else"),
}
```

### Loops

```rust
// loop - infinite loop
loop {
    println!("forever");
    break;  // exit the loop
}

// while
let mut n = 0;
while n < 5 {
    println!("{}", n);
    n += 1;
}

// for ( iterate over range)
for i in 0..5 {
    println!("{}", i);
}

// for with collection
let v = vec![1, 2, 3];
for item in v {
    println!("{}", item);
}
```

### Returning from Loops
```rust
let result = loop {
    break 42;  // breaks and returns 42
};
```

## Exercises

### Exercise 3.1
Write a function `fizzbuzz(n: u32)` that returns:
- "Fizz" if n is divisible by 3
- "Buzz" if n is divisible by 5
- "FizzBuzz" if divisible by both
- The number as string otherwise

### Exercise 3.2
Create a function that takes a number and returns true if it's a prime.

### Exercise 3.3
Write a program that uses `match` to convert a number (1-7) to a weekday name.

### Exercise 3.4
Create a program that sums all numbers from 1 to 100 using a for loop.

## Questions

1. What's the difference between `if` as a statement vs expression?
2. Why is `match` more powerful than switch in other languages?
3. What does `..` (range) operator do?