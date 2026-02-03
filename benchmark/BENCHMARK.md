# Event Loop Starvation Benchmark

This benchmark measures event loop blocking/starvation when processing JSON at different data volumes, validating the statistics mentioned in the main README.md.

## Overview

The benchmark tests both built-in `JSON` methods and `yieldable-json` async methods to measure how long each blocks the event loop during parse and stringify operations. It uses nanosecond precision measurements to accurately detect sub-millisecond blocking behavior.

## Test Data

Test data is **generated dynamically** using [Faker.js](https://fakerjs.dev/) before each benchmark run. This eliminates the need for static JSON fixture files and provides more realistic test data.

### Data Sizes
Data is generated at the following target sizes (doubled from original to account for 2017→2025 hardware improvements):
- **230 KB** (small) - doubled from 115 KB
- **654 KB** (medium) - doubled from 327 KB
- **2.6 MB** (large) - doubled from 1.3 MB
- **4.4 MB** (xlarge) - doubled from 2.2 MB

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
| 230 KB      | parse      | 1.91      | 12.25          |
| 230 KB      | stringify  | 0.86      | 6.86           |
| 654 KB      | parse      | 4.67      | 17.81          |
| 654 KB      | stringify  | 2.27      | 2.11           |
| 2.6 MB      | parse      | 15.72     | 47.20          |
| 2.6 MB      | stringify  | 21.28     | 3.08           |
| 4.4 MB      | parse      | 23.11     | 119.84         |
| 4.4 MB      | stringify  | 15.84     | 8.40           |

*Note: Times are maximum event loop delays (worst case) measured in nanoseconds and displayed in [ms] with 2 decimal precision*

### Key Insights

✅ **yieldable-json excels at stringify operations for large data**:
- At 2.6 MB: Native JSON blocks for 21.28ms, yieldable-json only 3.08ms (**85% faster**)
- At 4.4 MB: Native JSON blocks for 15.84ms, yieldable-json only 8.40ms (**47% faster**)

✅ **Consistent low blocking times**: yieldable-json maintains predictable ~2-8ms blocking for stringify regardless of data size

⚠️ **Parse operations show different characteristics**: 
- Native JSON is faster for parse operations on large data due to yielding overhead
- yieldable-json parse prevents complete event loop starvation but has higher worst-case times
- For parse-heavy workloads with large data, native JSON may be more appropriate
- yieldable-json is ideal for stringify-heavy workloads and high-concurrency scenarios
