# Lesson 1: Variables & Basic Types

## Variables

In Rust, variables are immutable by default. Use `mut` to make them mutable.

```rust
let x = 5;          // immutable
let mut y = 10;     // mutable
y = 20;             // OK
```

## Basic Data Types

### Integers
| Size   | Signed | Unsigned |
|--------|--------|----------|
| 8-bit  | i8     | u8       |
| 16-bit | i16    | u16      |
| 32-bit | i32    | u32      |
| 64-bit | i64    | u64      |

### Floats
- `f32` - 32-bit float
- `f64` - 64-bit float (default)

### Others
- `bool` - true or false
- `char` - single Unicode character (4 bytes)

## Operators

```rust
// Arithmetic
let sum = 5 + 10;
let diff = 10 - 5;
let product = 4 * 3;
let quotient = 10 / 3;    // integer division
let remainder = 10 % 3;

// Comparison
let is_equal = 5 == 5;
let is_greater = 10 > 5;
```

## Exercises

### Exercise 1.1
Create a file `src/bin/ex1-1.rs` that declares variables of each basic type and prints them.

### Exercise 1.2
Write a program that converts Celsius to Fahrenheit: `F = C * 9/5 + 32`

### Exercise 1.3
Create a program that calculates the area of a rectangle (area = width * height) and prints the result.

## Questions

1. What happens if you try to reassign an immutable variable?
2. What's the difference between `i32` and `u32`?
3. Why does Rust default to immutable variables?
