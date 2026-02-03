/* **************************************************************************
 * [DEPRECATED] Fixture Generator for Loop Starvation Benchmarks
 *
 * ⚠️ This file is deprecated and no longer used by the benchmark suite.
 *
 * The benchmark now uses dynamic data generation with Faker.js instead of
 * static JSON fixture files. See faker-data-generator.js for the new approach.
 *
 * Benefits of dynamic generation:
 * - No need to store ~20 large JSON files (saves disk space)
 * - Faster git operations (smaller repository)
 * - More realistic data with Faker.js
 * - Easier to modify test data generation
 * - Reproducible results with faker.seed()
 *
 * This file is kept for reference only.
 ***************************************************************************/
'use strict';

const fs = require('fs');
const path = require('path');

// Target sizes in bytes (doubled from original to compete with 2017→2025 hardware improvements)
const TARGET_SIZES = {
  small: 230 * 1024,      // 230KB (was 115KB)
  medium: 654 * 1024,     // 654KB (was 327KB)
  large: 2.6 * 1024 * 1024, // 2.6MB (was 1.3MB)
  xlarge: 4.4 * 1024 * 1024 // 4.4MB (was 2.2MB)
};

// Generate nested object-heavy structure
function generateNestedObjects(targetSize) {
  const obj = {};
  let currentSize = 0;
  let depth = 0;

  function addNestedLevel(parent, level) {
    const keys = ['data', 'metadata', 'config', 'settings', 'options', 'params', 'info', 'details'];
    for (let i = 0; i < 8 && currentSize < targetSize; i++) {
      const key = keys[i % keys.length] + level + '_' + i;
      if (level < 10) {
        parent[key] = {};
        currentSize += JSON.stringify({[key]: {}}).length;
        addNestedLevel(parent[key], level + 1);
      } else {
        parent[key] = `value_${level}_${i}_${'x'.repeat(50)}`;
        currentSize += JSON.stringify({[key]: parent[key]}).length;
      }
    }
  }

  addNestedLevel(obj, 0);
  return obj;
}

// Generate array-heavy structure
function generateArrayHeavy(targetSize) {
  const arr = [];
  let currentSize = 0;

  while (currentSize < targetSize) {
    const subArray = [];
    for (let i = 0; i < 50; i++) {
      subArray.push({
        id: arr.length * 50 + i,
        name: `Item_${arr.length}_${i}`,
        value: Math.random() * 1000,
        active: i % 2 === 0,
        tags: ['tag1', 'tag2', 'tag3']
      });
    }
    arr.push(subArray);
    currentSize = JSON.stringify(arr).length;
  }

  return arr;
}

// Generate string-heavy structure
function generateStringHeavy(targetSize) {
  const obj = {
    records: []
  };
  let currentSize = 0;

  // Generate long strings
  const baseString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris. ';

  while (currentSize < targetSize) {
    obj.records.push({
      id: obj.records.length,
      content: baseString.repeat(10),
      description: baseString.repeat(5),
      metadata: baseString.repeat(3)
    });
    currentSize = JSON.stringify(obj).length;
  }

  return obj;
}

// Generate mixed structure
function generateMixed(targetSize) {
  const obj = {
    arrays: [],
    objects: {},
    strings: [],
    numbers: [],
    nested: {}
  };
  let currentSize = 0;
  let counter = 0;

  const longString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.repeat(10);

  while (currentSize < targetSize) {
    // Add arrays
    obj.arrays.push([counter, counter + 1, counter + 2, {key: `value_${counter}`}]);

    // Add objects
    obj.objects[`key_${counter}`] = {
      id: counter,
      data: longString.substring(0, 100),
      nested: {
        value: counter * 2,
        items: [1, 2, 3, 4, 5]
      }
    };

    // Add strings
    obj.strings.push(longString.substring(0, 200));

    // Add numbers
    obj.numbers.push(Math.random() * 1000000);

    // Add nested structures
    if (counter % 10 === 0) {
      obj.nested[`level_${counter}`] = {
        a: { b: { c: { d: { e: `deep_${counter}` } } } }
      };
    }

    counter++;
    currentSize = JSON.stringify(obj).length;
  }

  return obj;
}

// Generate toJSON-heavy structure (objects with toJSON methods)
// Note: We can't actually save objects with toJSON methods to JSON files,
// so we generate the structure that simulates what toJSON would produce
function generateToJSONHeavy(targetSize) {
  const obj = {
    items: []
  };
  let currentSize = 0;
  let counter = 0;

  const baseString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';

  while (currentSize < targetSize) {
    // Simulate objects with toJSON methods
    // Each item represents what a toJSON() method would return
    obj.items.push({
      id: counter,
      type: 'toJSON-simulated',
      metadata: {
        bool: counter % 2 === 0,
        number: counter * 3.14,
        string: baseString.repeat(2),
        quoted: `"item_${counter}"`,
        null: null,
        array: [counter, counter + 1, counter + 2],
        nested: {
          value: {
            data: true,
            description: baseString,
            count: counter
          }
        }
      },
      timestamp: Date.now(),
      tags: ['tag1', 'tag2', 'tag3']
    });

    counter++;
    currentSize = JSON.stringify(obj).length;
  }

  return obj;
}

// Main generation function
function generateFixtures() {
  const fixturesDir = path.join(__dirname, 'fixtures');

  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  const types = {
    'nested-objects': generateNestedObjects,
    'array-heavy': generateArrayHeavy,
    'string-heavy': generateStringHeavy,
    'mixed': generateMixed,
    'toJSON-heavy': generateToJSONHeavy
  };

  for (const [sizeName, targetSize] of Object.entries(TARGET_SIZES)) {
    for (const [typeName, generator] of Object.entries(types)) {
      console.log(`Generating ${sizeName} (${targetSize} bytes) - ${typeName}...`);

      const data = generator(targetSize);
      const jsonString = JSON.stringify(data);
      const actualSize = Buffer.byteLength(jsonString, 'utf8');

      const filename = `${sizeName}-${typeName}.json`;
      const filepath = path.join(fixturesDir, filename);

      fs.writeFileSync(filepath, jsonString, 'utf8');

      console.log(`  Created: ${filename} (${actualSize} bytes, ${(actualSize / 1024).toFixed(2)} KB)`);
    }
  }

  console.log('\nFixture generation complete!');
}

// Run if executed directly
if (require.main === module) {
  generateFixtures();
}

module.exports = { generateFixtures };
