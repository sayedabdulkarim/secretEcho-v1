#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

console.log("🧪 Running Twinbo Backend Test Suite\n");

// Test configurations
const testConfigs = [
  {
    name: "Unit Tests",
    pattern: "tests/*.test.js",
    exclude: "integration.test.js",
  },
  {
    name: "Integration Tests",
    pattern: "tests/integration.test.js",
  },
  {
    name: "All Tests with Coverage",
    pattern: "tests/*.test.js",
    coverage: true,
  },
];

function runTest(config) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Running ${config.name}...`);
    console.log("━".repeat(50));

    const args = ["--testPathPattern", config.pattern];

    if (config.exclude) {
      args.push("--testPathIgnorePatterns", config.exclude);
    }

    if (config.coverage) {
      args.push("--coverage");
    }

    args.push("--verbose");

    const jest = spawn("npx", ["jest", ...args], {
      stdio: "inherit",
      cwd: process.cwd(),
    });

    jest.on("close", (code) => {
      if (code === 0) {
        console.log(`\n✅ ${config.name} passed!\n`);
        resolve();
      } else {
        console.log(`\n❌ ${config.name} failed!\n`);
        reject(new Error(`${config.name} failed with exit code ${code}`));
      }
    });

    jest.on("error", (error) => {
      console.error(`\n❌ Failed to start ${config.name}:`, error.message);
      reject(error);
    });
  });
}

async function runAllTests() {
  const startTime = Date.now();

  try {
    // Run unit tests first
    await runTest(testConfigs[0]);

    // Then integration tests
    await runTest(testConfigs[1]);

    // Finally, run all tests with coverage
    await runTest(testConfigs[2]);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("🎉 All tests completed successfully!");
    console.log(`⏱️  Total time: ${duration}s`);
    console.log("\n📊 Check the coverage report in the coverage/ directory");
  } catch (error) {
    console.error("💥 Test suite failed:", error.message);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: npm run test:all [options]

Options:
  --unit      Run only unit tests
  --integration   Run only integration tests
  --coverage  Run tests with coverage report
  --help, -h  Show this help message

Examples:
  npm run test:all
  npm run test:all --unit
  npm run test:all --integration
  npm run test:all --coverage
`);
  process.exit(0);
}

if (args.includes("--unit")) {
  runTest(testConfigs[0]).catch(() => process.exit(1));
} else if (args.includes("--integration")) {
  runTest(testConfigs[1]).catch(() => process.exit(1));
} else if (args.includes("--coverage")) {
  runTest(testConfigs[2]).catch(() => process.exit(1));
} else {
  runAllTests();
}
