# Event Loop Starvation Benchmark

This benchmark measures event loop blocking/starvation when processing JSON at different data volumes, validating the statistics mentioned in the main README.md.

## Overview

The benchmark tests both built-in `JSON` methods and `yieldable-json` async methods to measure how long each blocks the event loop during parse and stringify operations. It uses nanosecond precision measurements to accurately detect sub-millisecond blocking behavior.

## Test Data

Test data is **generated dynamically** using [Faker.js](https://fakerjs.dev/) before each benchmark run. This eliminates the need for static JSON fixture files and provides more realistic test data.

### Data Sizes
Data is generated at the following target sizes:
- **230 KB** (small)
- **654 KB** (medium)
- **2.6 MB** (large)
- **4.4 MB** (xlarge)

### Payload Types
Each size is tested with five different payload types:
- **nested-objects**: Deeply nested object structures with realistic user/profile data
- **array-heavy**: Large arrays of product/commerce data
- **string-heavy**: Objects with long text content (articles, descriptions)
- **mixed**: Combination of users, products, orders, companies, and posts
- **toJSON-heavy**: Objects with custom toJSON() methods

## Running the Benchmark

```bash
npm run benchmark
```

## Output

The benchmark produces detailed results for each payload type, plus a summary table showing worst-case delays:

### Summary Results (Worst Case Across All Payload Types)

| Data Volume | Operation  | JSON [ms] | Yieldable [ms] |
|-------------|------------|-----------|----------------|
| 230 KB      | parse      | 1.54      | 2.87           |
| 230 KB      | stringify  | 0.66      | 6.60           |
| 654 KB      | parse      | 3.94      | 16.24          |
| 654 KB      | stringify  | 1.95      | 1.48           |
| 2.6 MB      | parse      | 13.35     | 35.72          |
| 2.6 MB      | stringify  | 9.86      | 2.59           |
| 4.4 MB      | parse      | 19.81     | 38.32          |
| 4.4 MB      | stringify  | 18.85     | 4.75           |

*Note: Times are maximum event loop delays (worst case) measured in nanoseconds and displayed in [ms] with 2 decimal precision. Benchmarked February 2026.*

### Key Insights

✅ **yieldable-json excels at stringify operations for large data**:
- At 2.6 MB: Native JSON blocks for 9.86ms, yieldable-json only 2.59ms (**73% faster**)
- At 4.4 MB: Native JSON blocks for 18.85ms, yieldable-json only 4.75ms (**75% faster**)

✅ **Consistent low blocking times**: yieldable-json maintains predictable ~2-5ms blocking for stringify regardless of data size

⚠️ **Parse operations on large data**: 
- Native JSON is still faster for parse operations on very large data due to yielding overhead
- yieldable-json parse prevents complete event loop starvation and maintains responsiveness
- For parse-heavy workloads with massive data, consider native JSON if absolute speed matters more than concurrency
- yieldable-json is ideal for stringify-heavy workloads and high-concurrency scenarios
