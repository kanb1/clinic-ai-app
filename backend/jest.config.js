/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest", //skriv test i ts
  testEnvironment: "node",
  collectCoverage: true, //lav automatisk en mappekaldet collect inde i backend
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"], //text viser rapport i terminalen som jeg ville have, lcov html rapport i coverage/lcov-report/index.html
  testMatch: ["**/tests/**/*.test.ts"], //finder kun test-filer som ligger i en mappe kaldet __tests__ og slutter på .test.ts
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  coverageThreshold: {
    global: {
      branches: 75, //I coeverageTreshold angiver jeg minimumskrav på 75%
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
