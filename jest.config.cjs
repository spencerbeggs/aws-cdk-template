module.exports = {
	verbose: true,
	roots: ["<rootDir>/test"],
	testMatch: ["**/*.test.ts"],
	transform: {
		"^.+\\.m?ts$": "ts-jest"
	},
	extensionsToTreatAsEsm: [".ts", ".mts"],
	globals: {
		"ts-jest": {
			useESM: true
		}
	},
	collectCoverage: true,
	moduleNameMapper: {
		"^@base/app$": "<rootDir>/lib/base/app",
		"^@base/constructs$": "<rootDir>/lib/base/constructs",
		"^@base/stacks$": "<rootDir>/lib/base/stacks"
	}
};
