import { describe, expect, test } from "vitest";
import { twoSum } from "./two-sum";

describe("twoSum", () => {
	test("should find indexes of addends", () => {
		expect(twoSum([2, 7, 11, 15], 9)).toEqual([0, 1]);
	});
});
