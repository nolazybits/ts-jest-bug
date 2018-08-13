
module.exports = {
    globals: {
        "ts-jest": {
            skipBabel: true,
            disableSourceMapSupport: true
        }
    },
    roots: [
        "<rootDir>/src",
        "<rootDir>/tests"
    ],
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    testRegex: "(/tests/.*.(test|spec)).ts$",
    moduleFileExtensions: [
        "js",
        "ts",
        "json",
        "node"
    ],
    collectCoverage: true,
    collectCoverageFrom: [
        "**/src/**"
    ],
    coverageThreshold: {
        global: {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100
        }
    },
    coveragePathIgnorePatterns: [
        "(tests/.*.mock).ts$",
        "**/dist/**"
    ],
    setupTestFrameworkScriptFile: "jest-extended",
    testEnvironment: "node",
    verbose: true,
    name: "ts-jest-bug",
    displayName: "ts-jest-bug",
    coveragePathIgnorePatterns: [
        "(tests/.*\.mock)\.(jsx?|tsx?)$",
        "src/index.ts"
    ]
};