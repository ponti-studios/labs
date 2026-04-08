class Effect<Success, Failure = never> {
	private thunk: () => Success;

	constructor(thunk: () => Success) {
		this.thunk = thunk;
	}

	static of<Success>(fn: () => Success): Effect<Success> {
		return new Effect(fn);
	}

	static async<Success>(fn: () => Promise<Success>): Effect<Promise<Success>> {
		return new Effect(fn);
	}

	run(): Success {
		return this.thunk();
	}

	runPromise(): Promise<Awaited<Success>> {
		return Promise.resolve(this.thunk());
	}

	map<U>(fn: (value: Awaited<Success>) => U): Effect<Promise<U>> {
		return new Effect(() => {
			const result = this.thunk();
			return result instanceof Promise
				? result.then(fn)
				: Promise.resolve(fn(result as Awaited<Success>));
		});
	}

	flatMap<U>(fn: (value: Awaited<Success>) => Effect<U>): Effect<Promise<U>> {
		return new Effect(() => {
			const result = this.thunk();
			return result instanceof Promise
				? result.then((x) => fn(x).runPromise())
				: Promise.resolve(fn(result as Awaited<Success>).run());
		});
	}
}

// ======================
// MAP vs FLATMAP EXAMPLES
// ======================

console.log("=== MAP EXAMPLE ===");
// map: transforms the VALUE inside the Effect
const mapExample = Effect.of(() => 5)
	.map((x) => x * 2) // transforms 5 -> 10
	.map((x) => x + 1) // transforms 10 -> 11
	.map((x) => `Result: ${x}`) // transforms 11 -> "Result: 11"
	.run();

console.log("Map result:", mapExample); // "Result: 11"

console.log("\n=== FLATMAP EXAMPLE ===");
// flatMap: transforms the VALUE and returns a NEW Effect, then flattens it
const flatMapExample = Effect.of(() => 5)
	.flatMap((x) => Effect.of(() => x * 2)) // 5 -> Effect(10) -> 10
	.flatMap((x) => Effect.of(() => x + 1)) // 10 -> Effect(11) -> 11
	.flatMap((x) => Effect.of(() => `Result: ${x}`)) // 11 -> Effect("Result: 11") -> "Result: 11"
	.run();

console.log("FlatMap result:", flatMapExample); // "Result: 11"

const promiseEffect = Effect.async(() => Promise.resolve(42))
	.map((x) => x * 2)
	.flatMap((x) => Effect.of(() => x + 1))
	.runPromise();

console.log("\n=== ASYNC EFFECT EXAMPLE ===");
promiseEffect.then((result) => {
	console.log("Async Effect result:", result); // 85
});
