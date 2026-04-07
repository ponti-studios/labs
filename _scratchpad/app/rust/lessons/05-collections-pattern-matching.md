# Lesson 5: Collections & Pattern Matching

## Collections

### Vector
```rust
let v = vec![1, 2, 3];  // create
let v: Vec<i32> = Vec::new();  // empty vector

v.push(4);  // add element
let first = v[0];  // indexing (panics on error)
let first = v.get(0);  // returns Option

for i in &v {
    println!("{}", i);
}
```

### String
```rust
let s = String::from("hello world");
let slice = &s[0..5];  // "hello"
let chars: Vec<char> = s.chars().collect();

s.push_str(" extra");
let concatenated = format!("{} {}", s, "!");
```

### HashMap
```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert("blue", 10);
scores.insert("red", 50);

let team = "blue";
let score = scores.get(team);  // Option<&V>

for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```

## Pattern Matching (match)

```rust
let x = 1;

match x {
    1 => println!("one"),
    2 | 3 => println!("two or three"),  // or pattern
    4..=10 => println!("four to ten"),   // range
    _ => println!("something else"),
}

// with destructuring
let p = (1, 2);
match p {
    (x, y) if x + y == 3 => println!("sum is 3"),
    (x, _) if x > 0 => println!("x is positive"),
    _ => println!("other"),
}

// matching enums
enum Result {
    Ok(i32),
    Err(String),
}

let r = Result::Ok(42);
match r {
    Result::Ok(n) => println!("got: {}", n),
    Result::Err(e) => println!("error: {}", e),
}

// if let - for single case
if let Result::Ok(n) = r {
    println!("{}", n);
}
```

## Pattern Matching in Other Places

### if let
```rust
let mut opt = Some(5);
if let Some(n) = opt {
    println!("{}", n);
}
```

### while let
```rust
let mut stack = vec![1, 2, 3];
while let Some(n) = stack.pop() {
    println!("{}", n);
}
```

### for loop
```rust
for (i, v) in vec!['a', 'b', 'c'].iter().enumerate() {
    println!("{}: {}", i, v);
}
```

### let binding
```rust
let (a, b) = (1, 2);  // destructure tuple
```

## Exercises

### Exercise 5.1
Create a vector of numbers and write a function to find the average.

### Exercise 5.2
Use a HashMap to count the occurrences of each word in a sentence.

### Exercise 5.3
Create a match expression that handles different Result variants and extracts the value or error message.

### Exercise 5.4
Write a program that uses pattern matching to parse a simple command: "add 5 3", "sub 5 3", etc.

### Exercise 5.5
Create a function that uses `if let` to safely handle an Option and provide a default value.

## Questions

1. When should you use `&v` vs `&mut v` in a for loop?
2. What's the difference between `get()` and `[]` on a Vector?
3. When is `if let` preferred over `match`?