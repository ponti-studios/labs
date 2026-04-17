fn main() {
    let s1 = "hello"; // string slice
    let s2: &str = "world";

    let mut s3 = String::from("hello");
    s3.push_str(", world!");
    println!("s1: {}", s1);
    println!("s2: {}", s2);
    println!("s3: {}", s3);

    let s4 = String::from("foo");
    let s5 = s4.clone(); // deep copy
    println!("s4: {}, s5: {}", s4, s5);

    let s6 = String::from("hello");
    let s7 = s6; // move (s6 no longer valid)
    println!("s7: {}", s7);
    // println!("{}", s6); // ERROR: s6 was moved

    let s8 = String::from("hello");
    let len = s8.len();
    println!("len of '{}': {}", s8, len);
}
