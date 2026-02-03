/* **************************************************************************
 * Event Loop Starvation Benchmark
 *
 * Measures event loop blocking/starvation when processing JSON at different sizes
 * Simulates concurrent operations competing for event loop time
 * Validates the statistics shown in README.md
 *
 * Tests both built-in JSON and yieldable-json with various payload types
 * Uses nanosecond precision (process.hrtime.bigint) for accurate measurements
 * Generates test data dynamically using Faker.js (no static fixture files needed)
 ***************************************************************************/
'use strict';

const jsony = require('../index');
const toJSONGenerator = require('./toJSON-data-generator');
const fakerGenerator = require('./faker-data-generator');

// Benchmark configuration
const INTENSITY = 32; // Maximum intensity for best performance

// Fixture mapping to README sizes (doubled to compete with 2017→2025 hardware improvements)
const FIXTURES = {
  '230 KB': 'small',
  '654 KB': 'medium',
  '2.6 MB': 'large',
  '4.4 MB': 'xlarge'
};

const PAYLOAD_TYPES = ['nested-objects', 'array-heavy', 'string-heavy', 'mixed', 'toJSON-heavy'];

// Results storage
const results = [];

// Event loop monitor that measures blocking/starvation
// This simulates a concurrent task trying to get event loop time
class LoopMonitor {
  constructor() {
    this.maxDelay = 0n;
    this.lastCheck = null;
    this.timers = [];
    this.isMonitoring = false;
    this.checkCount = 0;
  }

  start() {
    this.maxDelay = 0n;
    this.lastCheck = process.hrtime.bigint();
    this.isMonitoring = true;
    this.checkCount = 0;
    this.scheduleCheck();
  }

  scheduleCheck() {
    if (!this.isMonitoring) return;

    // Use setImmediate to compete for event loop time
    const timer = setImmediate(() => {
      if (!this.isMonitoring) return;

      const now = process.hrtime.bigint();
      const delay = now - this.lastCheck;

      if (delay > this.maxDelay) {
        this.maxDelay = delay;
      }

      this.lastCheck = now;
      this.checkCount++;
      this.scheduleCheck();
    });

    this.timers.push(timer);
  }

  stop() {
    this.isMonitoring = false;
    // Clean up any pending timers
    for (const timer of this.timers) {
      clearImmediate(timer);
    }
    this.timers = [];
    return this.maxDelay;
  }

  getMaxDelayMs() {
    return Number(this.maxDelay) / 1_000_000; // Convert nanoseconds to milliseconds
  }

  getCheckCount() {
    return this.checkCount;
  }
}

// Load fixture file
// Generate test data dynamically using Faker
function loadFixture(sizeName, payloadType) {
  // toJSON-heavy payloads must be generated at runtime (can't be stored as JSON)
  if (payloadType === 'toJSON-heavy') {
    const object = toJSONGenerator.generateBySize(sizeName);
    const content = JSON.stringify(object);
    return { content, object };
  }

  // Generate data dynamically using Faker.js
  const object = fakerGenerator.generateData(sizeName, payloadType);
  const content = JSON.stringify(object);
  return { content, object };
}

// Benchmark built-in JSON.stringify
function benchmarkNativeStringify(data, sizeName, payloadType) {
  return new Promise((resolve) => {
    const monitor = new LoopMonitor();

    // Start monitoring first
    setImmediate(() => {
      monitor.start();

      // Give monitor time to start checking
      setImmediate(() => {
        // This blocks synchronously - monitor will see the starvation
        const result = JSON.stringify(data);

        // Stop after a small delay to capture final measurements
        setImmediate(() => {
          const maxDelay = monitor.stop();

          results.push({
            size: sizeName,
            operation: 'stringify',
            payloadType: payloadType,
            method: 'JSON (built-in)',
            delayNs: maxDelay
          });

          resolve(result);
        });
      });
    });
  });
}

// Benchmark built-in JSON.parse
function benchmarkNativeParse(jsonString, sizeName, payloadType) {
  return new Promise((resolve) => {
    const monitor = new LoopMonitor();

    // Start monitoring first
    setImmediate(() => {
      monitor.start();

      // Give monitor time to start checking
      setImmediate(() => {
        // This blocks synchronously - monitor will see the starvation
        const result = JSON.parse(jsonString);

        // Stop after a small delay to capture final measurements
        setImmediate(() => {
          const maxDelay = monitor.stop();

          results.push({
            size: sizeName,
            operation: 'parse',
            payloadType: payloadType,
            method: 'JSON (built-in)',
            delayNs: maxDelay
          });

          resolve(result);
        });
      });
    });
  });
}

// Benchmark yieldable-json stringifyAsync
function benchmarkYieldableStringify(data, sizeName, payloadType) {
  return new Promise((resolve, reject) => {
    const monitor = new LoopMonitor();

    // Start monitoring first
    setImmediate(() => {
      monitor.start();

      // Give monitor time to start checking
      setImmediate(() => {
        // This yields periodically - monitor should see smaller delays
        // API: stringifyAsync(data, replacer, space, intensity, callback)
        jsony.stringifyAsync(data, null, null, INTENSITY, (err, result) => {
          if (err) {
            monitor.stop();
            return reject(err);
          }

          // Stop after operation completes
          setImmediate(() => {
            const maxDelay = monitor.stop();

            results.push({
              size: sizeName,
              operation: 'stringify',
              payloadType: payloadType,
              method: 'yieldable-json',
              delayNs: maxDelay
            });

            resolve(result);
          });
        });
      });
    });
  });
}

// Benchmark yieldable-json parseAsync
function benchmarkYieldableParse(jsonString, sizeName, payloadType) {
  return new Promise((resolve, reject) => {
    const monitor = new LoopMonitor();

    // Start monitoring first
    setImmediate(() => {
      monitor.start();

      // Give monitor time to start checking
      setImmediate(() => {
        // This yields periodically - monitor should see smaller delays
        // API: parseAsync(data, reviver, intensity, callback)
        jsony.parseAsync(jsonString, null, INTENSITY, (err, result) => {
          if (err) {
            monitor.stop();
            return reject(err);
          }

          // Stop after operation completes
          setImmediate(() => {
            const maxDelay = monitor.stop();

            results.push({
              size: sizeName,
              operation: 'parse',
              payloadType: payloadType,
              method: 'yieldable-json',
              delayNs: maxDelay
            });

            resolve(result);
          });
        });
      });
    });
  });
}

// Run all benchmarks
async function runBenchmarks() {
  console.log('='.repeat(80));
  console.log('Loop Starvation Benchmark');
  console.log('Testing event loop availability during JSON operations');
  console.log('Intensity:', INTENSITY);
  console.log('='.repeat(80));
  console.log();

  for (const [readableSize, sizeName] of Object.entries(FIXTURES)) {
    console.log(`Testing ${readableSize}...`);

    for (const payloadType of PAYLOAD_TYPES) {
      process.stdout.write(`  ${payloadType}... `);

      try {
        const { content, object } = loadFixture(sizeName, payloadType);

        // Test stringify operations
        await benchmarkNativeStringify(object, readableSize, payloadType);
        await benchmarkYieldableStringify(object, readableSize, payloadType);

        // Test parse operations
        await benchmarkNativeParse(content, readableSize, payloadType);
        await benchmarkYieldableParse(content, readableSize, payloadType);

        console.log('✓');
      } catch (error) {
        console.log('✗');
        console.error(`    Error: ${error.message}`);
      }
    }
    console.log();
  }
}

// Format table output
function formatTable() {
  console.log('='.repeat(80));
  console.log('RESULTS: Event Loop Lag [ms]');
  console.log('='.repeat(80));
  console.log();

  // Group by size and operation
  const sizes = Object.keys(FIXTURES);
  const operations = ['parse', 'stringify'];

  for (const operation of operations) {
    console.log(`\n${operation.toUpperCase()} Operation:`);
    console.log('-'.repeat(80));

    // Header
    const header = `| ${'Data Volume'.padEnd(12)} | ${'Payload Type'.padEnd(15)} | ${'JSON [ms]'.padEnd(10)} | ${'Yieldable [ms]'.padEnd(14)} |`;
    console.log(header);
    console.log('|' + '-'.repeat(14) + '|' + '-'.repeat(17) + '|' + '-'.repeat(12) + '|' + '-'.repeat(16) + '|');

    // Data rows
    for (const size of sizes) {
      for (const payloadType of PAYLOAD_TYPES) {
        const nativeResult = results.find(r =>
          r.size === size && r.operation === operation &&
          r.payloadType === payloadType && r.method === 'JSON (built-in)'
        );
        const yieldableResult = results.find(r =>
          r.size === size && r.operation === operation &&
          r.payloadType === payloadType && r.method === 'yieldable-json'
        );

        const nativeMs = nativeResult ? (Number(nativeResult.delayNs) / 1_000_000).toFixed(2) : 'N/A';
        const yieldableMs = yieldableResult ? (Number(yieldableResult.delayNs) / 1_000_000).toFixed(2) : 'N/A';

        const row = `| ${size.padEnd(12)} | ${payloadType.padEnd(15)} | ${nativeMs.padEnd(10)} | ${yieldableMs.padEnd(14)} |`;
        console.log(row);
      }
    }
  }

  console.log();
  console.log('='.repeat(80));
  console.log('Summary (aggregated by size - worst case across all payload types):');
  console.log('='.repeat(80));
  console.log();

  // Summary table matching README format
  const summaryHeader = `| ${'Data Volume'.padEnd(12)} | ${'Operation'.padEnd(10)} | ${'JSON [ms]'.padEnd(10)} | ${'Yieldable [ms]'.padEnd(14)} |`;
  console.log(summaryHeader);
  console.log('|' + '-'.repeat(14) + '|' + '-'.repeat(12) + '|' + '-'.repeat(12) + '|' + '-'.repeat(16) + '|');

  for (const size of sizes) {
    for (const operation of operations) {
      // Calculate worst case (max) across all payload types
      const nativeResults = results.filter(r =>
        r.size === size && r.operation === operation && r.method === 'JSON (built-in)'
      );
      const yieldableResults = results.filter(r =>
        r.size === size && r.operation === operation && r.method === 'yieldable-json'
      );

      const nativeMaxNs = Math.max(...nativeResults.map(r => Number(r.delayNs)));
      const yieldableMaxNs = Math.max(...yieldableResults.map(r => Number(r.delayNs)));

      const nativeMaxMs = (nativeMaxNs / 1_000_000).toFixed(2);
      const yieldableMaxMs = (yieldableMaxNs / 1_000_000).toFixed(2);

      const row = `| ${size.padEnd(12)} | ${operation.padEnd(10)} | ${nativeMaxMs.padEnd(10)} | ${yieldableMaxMs.padEnd(14)} |`;
      console.log(row);
    }
  }

  console.log();
  console.log('Note: Times shown are maximum event loop delays (worst case)');
  console.log('      Measured in nanoseconds, displayed in [ms] with 2 decimal precision');
  console.log('      Lower values indicate better responsiveness and less loop starvation');
  console.log();
  console.log('='.repeat(80));
}

// Main execution
async function main() {
  try {
    await runBenchmarks();
    formatTable();
  } catch (error) {
    console.error('Benchmark failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { runBenchmarks, formatTable };
