/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	verbose: true,
	roots: ["<rootDir>/test"],
	testMatch: ["**/*.test.ts"],
	transform: {
		"^.+\\.tsx?$": "ts-jest"
	},
	collectCoverage: true,
	coverageReporters: ["json", "text"],
	coverageThreshold:
		process.env.TEST_ENV === "ci"
			? {
					global: {
						branches: 100,
						functions: 100,
						lines: 100,
						statements: 100
					}
			  }
			: undefined
};
