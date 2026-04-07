# Lesson 4: Structs & Enums

## Structs

A struct groups related data together.

### Basic Struct
```rust
struct User {
    username: String,
    email: String,
    active: bool,
}

fn main() {
    let user = User {
        username: String::from("alice"),
        email: String::from("alice@example.com"),
        active: true,
    };
    
    println!("{}", user.username);
}
```

### Tuple Struct
```rust
struct Color(i32, i32, i32);
struct Point(f64, f64);

let black = Color(0, 0, 0);
let origin = Point(0.0, 0.0);
```

### Methods
```rust
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
    
    fn new(width: u32, height: u32) -> Self {
        Rectangle { width, height }
    }
}
```

## Enums

An enum represents a type that can be one of several variants.

### Basic Enum
```rust
enum Direction {
    Up,
    Down,
    Left,
    Right,
}

fn move(dir: Direction) {
    match dir {
        Direction::Up => println!("moving up"),
        Direction::Down => println!("moving down"),
        _ => println!("moving sideways"),
    }
}
```

### Enum with Data
```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(u8, u8, u8),
}

let m = Message::Move { x: 10, y: 20 };
```

### Option Enum

Rust's built-in enum for handling values that may or may not exist:

```rust
enum Option<T> {
    Some(T),
    None,
}

let x: Option<i32> = Some(5);
let y: Option<i32> = None;

match x {
    Some(n) => println!("Got: {}", n),
    None => println!("Nothing"),
}
```

## The Option Type

```rust
let numbers = vec![1, 2, 3];
let first = numbers.get(0);  // returns Option<&i32>

if let Some(n) = first {
    println!("First is {}", n);
}

// or with unwrap
let n = first.unwrap();  // panics if None
```

## Exercises

### Exercise 4.1
Create a `Rectangle` struct with width and height. Add methods for `area()` and `perimeter()`.

### Exercise 4.2
Create an `enum Shape` with variants `Circle(f64)` and `Rectangle(f64, f64)`. Add an `area()` method to each.

### Exercise 4.3
Create a program using `Option<i32>` that safely divides two numbers, returning `None` if dividing by zero.

### Exercise 4.4
Define a `Message` enum with variants for a simple chat app (Text, Image, Delete). Handle each in a match.

## Questions

1. What's the difference between a struct and a tuple struct?
2. Why use enums instead of multiple structs?
3. What's the advantage of `Option<T>` over using null?