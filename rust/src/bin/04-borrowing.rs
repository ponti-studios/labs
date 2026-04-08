fn main() {
    let s1 = String::from("hello");

    let len = calculate_length(&s1);
    println!("Length of '{}' is {}", s1, len);

    let mut s2 = String::from("hello");
    change(&mut s2);
    println!("Changed: {}", s2);

    let mut s3 = String::from("hello");
    let r1 = &mut s3;
    println!("r1: {}", r1);
    // let r2 = &mut s3; // ERROR: can't have two mutable refs
    println!("s3 after r1: {}", s3);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn change(s: &mut String) {
    s.push_str(", world");
}
