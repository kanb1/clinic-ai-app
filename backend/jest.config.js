/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest", //skriv test i ts
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.ts"], //hvor jeg har sat env op til de forskellige controllers
  collectCoverage: true, //lav automatisk en mappekaldet collect inde i backend
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/tests/**"], //Indsaml coverage på alle filer i src/ — også dem der ikke blev importeret i tests. Tvinger jest til at inkludere alle filer
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"], //text viser rapport i terminalen som jeg ville have, lcov html rapport i coverage/lcov-report/index.html
  testMatch: ["**/tests/**/*.test.ts"], //finder kun test-filer som ligger i en mappe kaldet __tests__ og slutter på .test.ts
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  coverageThreshold: {
    global: {
      branches: 70, //I coeverageTreshold angiver jeg minimumskrav på 75%
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
