fn main() {
    let x = 5;
    let y = double(x); // x is copied, still valid
    println!("x = {}, doubled = {}", x, y);

    let s1 = String::from("hello");
    let s2 = take_ownership(s1); // s1 moved into function
                                 // println!("{}", s1); // ERROR: s1 no longer valid
    println!("s2: {}", s2);

    let s3 = String::from("hello");
    let s4 = borrow_and_return(s3); // s3 borrowed, still valid
    println!("s3: {}, s4: {}", s3, s4);
}

fn double(n: i32) -> i32 {
    n * 2
}

fn take_ownership(s: String) -> String {
    println!("Took ownership of: {}", s);
    s
}

fn borrow_and_return(s: &String) -> String {
    format!("borrowed: {}", s)
}
