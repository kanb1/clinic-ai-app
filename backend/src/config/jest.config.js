/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: "ts-jest", //skriv test i ts
  testEnvironment: "node",
  //jest.setup.ts fil køres automatisk
  // samt mocket openai klient -> fake responses i alle testfiler + env.test
  setupFiles: ["<rootDir>/jest.setup.ts"],
  //lav automatisk en mappekaldet collect inde i backend
  collectCoverage: true,
  //Indsaml coverage på alle filer i src/ — også dem der ikke blev importeret i tests. Tvinger jest til at inkludere alle filer
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/tests/**"],
  coverageDirectory: "coverage",
  //text viser rapport i terminalen som jeg ville have, lcov html rapport i coverage/lcov-report/index.html
  coverageReporters: ["text", "lcov"],
  //finder kun test-filer som ligger i en mappe kaldet __tests__ og slutter på .test.ts
  testMatch: ["**/tests/**/*.test.ts"],
  // jest skla gå igennem alle ts og tsx filer (typescript)
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
  // test converage minimumskrav
  coverageThreshold: {
    global: {
      // if-else-grene
      branches: 70,
      // funktioner/metoder
      functions: 70,
      lines: 70,
      // generelle statements
      statements: 70,
    },
  },
};
