/** @type {import('jest').Config} */
export default {
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.test.js", "**/*.test.js"],
    testTimeout: 30000,
    setupFilesAfterEnv: ["./src/__tests__/setup.js"],
    transform: {},
}
