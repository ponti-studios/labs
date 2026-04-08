fn c_to_f(c: f64) -> f64 {
    c * 9.0 / 5.0   + 32.0
}

fn main() {
    let x = 5;
    let y = 10;
    println!("x = {}", x);
    println!("y = {}", y);
    println!("x + y = {}", x + y);

    let mut z = 1;
    println!("z (initial value) = {}", z);

    z = 2;

    println!("z (mut) = {}", z);

    let a: i32 = 42 + z;
    let c: bool = true;
    let d: char = 'x';
    println!("a = {} (i32)", a);
    println!("b = {} (f64)", 3.14);
    println!("c = {} (bool)", c);
    println!("d = {} (char)", d);
    println!("0°C = {}°F", c_to_f(0.0));
}
