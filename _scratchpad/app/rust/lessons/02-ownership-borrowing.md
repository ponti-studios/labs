# Lesson 2: Ownership & Borrowing

This is Rust's most unique and important concept.

## Ownership Rules

1. Each value in Rust has an **owner**
2. There can only be **one owner** at a time
3. When the owner goes out of scope, the value is **dropped**

```rust
fn main() {
    let s1 = String::from("hello");
    let s2 = s1;  // ownership moves to s2
    // println!("{}", s1); // ERROR: s1 is no longer valid
    println!("{}", s2);    // OK
}
```

## Borrowing

Instead of transferring ownership, you can **borrow** a value using references.

### Immutable Borrow
```rust
fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);  // borrow s1
    println!("{} has length {}", s1, len);  // s1 still valid
}

fn calculate_length(s: &String) -> usize {
    s.len()  // s is a reference
}
```

### Mutable Borrow
```rust
fn main() {
    let mut s = String::from("hello");
    change(&mut s);
    println!("{}", s);  // prints "hello, world"
}

fn change(s: &mut String) {
    s.push_str(", world");
}
```

## Rules of Borrowing

1. You can have **either** one mutable reference **OR** many immutable references
2. References must always be valid

## Borrowing vs Moving

| Operation | Ownership | Original variable |
|-----------|-----------|-------------------|
| `let s2 = s1` | Moves | Invalid |
| `let s2 = &s1` | Borrows | Valid |
| `let s2 = &mut s1` | Mutable borrow | Valid |

## Exercises

### Exercise 2.1
Create a file that demonstrates both moving and borrowing with a String.

### Exercise 2.2
Write a function that takes two string references and returns which one is longer.

### Exercise 2.3
Create a program with a mutable reference that demonstrates the "one mutable reference" rule.

## Questions

1. Why does Rust need ownership?
2. What is a "use after free" error and how does Rust prevent it?
3. When would you use borrowing instead of moving?