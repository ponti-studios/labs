class Bird {
  makeNoise() {
    return "chirp";
  }

  fly() {
    return "fly";
  }
}

const bird = new Bird();

class Parrot extends Bird {
  makeNoise(): string {
    return "hello";
  }
}

const parrot = new Parrot();

console.table({
  "Bird.makeNoise()": bird.makeNoise(),
  "Bird.fly()": bird.fly(),
  "Parrot.makeNoise()": parrot.makeNoise(),
  "Parrot.fly()": parrot.fly(),
});
