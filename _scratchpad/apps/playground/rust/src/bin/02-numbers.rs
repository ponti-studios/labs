fn main() {
    let i: i32 = 1;
    let i8: i8 = 127;
    let i64: i64 = 1_000_000;

    let u: u32 = 10;
    let u8: u8 = 255;

    let f: f64 = 3.14;
    let f32: f32 = 2.5;

    println!("Integers: i={}, i8={}, i64={}", i, i8, i64);
    println!("Unsigned: u={}, u8={}", u, u8);
    println!("Floats: f={}, f32={}", f, f32);

    let sum = 5 + 10;
    let diff = 95.5 - 4.3;
    let product = 4 * 30;
    let quotient = 56.7 / 32.2;
    let remainder = 43 % 5;

    println!("\nOperations:");
    println!("5 + 10 = {}", sum);
    println!("95.5 - 4.3 = {}", diff);
    println!("4 * 30 = {}", product);
    println!("56.7 / 32.2 = {}", quotient);
    println!("43 % 5 = {}", remainder);
}
