/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest", //skriv test i ts
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"], //text viser rapport i terminalen som jeg ville have, lcov html rapport i coverage/lcov-report/index.html
  testMatch: ["**/__tests__/**/*.test.ts"], //finder kun test-filer som ligger i en mappe kaldet __tests__ og slutter på .test.ts
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};
