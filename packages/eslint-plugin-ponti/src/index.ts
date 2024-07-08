import {
	BASE,
	FUNCTIONAL_LITE,
	REACT_NATIVE,
	TESTS,
	TYPESCRIPT,
} from "./configs";

// eslint-disable-next-line functional/immutable-data
module.exports = {
	// ─────────────────────────────────────────────────────────────────────
	// ── CONFIGS ──────────────────────────────────────────────────────────
	configs: {
		"@ponti-base": BASE,
		// TS + RN
		"@ponti-typescript": TYPESCRIPT,
		"@ponti-react-native": REACT_NATIVE,
		"@ponti-functional-lite": FUNCTIONAL_LITE,
		"@ponti-tests": TESTS,
		"@ponti-global-prettier-override": {
			extends: ["plugin:prettier/recommended"],
		},
	},
	rules: {},
};
