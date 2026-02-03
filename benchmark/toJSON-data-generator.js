/* **************************************************************************
 * toJSON Test Data Generator
 *
 * Generates objects with toJSON methods for benchmarking
 * Cannot be stored as JSON files - must be generated at runtime
 ***************************************************************************/
'use strict';

// Class with toJSON method - simple structure
class SimpleToJSON {
  constructor(id) {
    this.id = id;
    this.bool = id % 2 === 0;
    this.number = id * 3.14;
    this.string = `Item ${id}`;
    this.quoted = `"item_${id}"`;
    this.null = null;
  }

  toJSON() {
    return {
      id: this.id,
      bool: this.bool,
      number: this.number,
      string: this.string,
      quoted: this.quoted,
      null: this.null,
    };
  }
}

// Class with toJSON method - nested structure
class NestedToJSON {
  constructor(id) {
    this.id = id;
    this.value = {
      data: true,
      string: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ',
      number: id * 42,
      array: [id, id + 1, id + 2],
    };
    this.metadata = {
      timestamp: Date.now(),
      type: 'nested',
      tags: ['tag1', 'tag2', 'tag3'],
    };
  }

  toJSON() {
    return {
      id: this.id,
      value: this.value,
      metadata: this.metadata,
    };
  }
}

// Class with toJSON method - complex nested structure
class ComplexToJSON {
  constructor(id) {
    this.id = id;
    this.nested = {
      level1: {
        level2: {
          level3: {
            value: `deep_${id}`,
            count: id,
          },
        },
      },
    };
    this.items = [];
    for (let i = 0; i < 10; i++) {
      this.items.push({
        index: i,
        value: `item_${id}_${i}`,
        active: i % 2 === 0,
      });
    }
  }

  toJSON() {
    return {
      id: this.id,
      nested: this.nested,
      items: this.items,
      computed: `computed_${this.id}`,
    };
  }
}

// Generate toJSON-heavy data structure
function generateToJSONHeavy(targetSize) {
  const container = {
    simpleItems: [],
    nestedItems: [],
    complexItems: [],
  };

  let currentSize = 0;
  let counter = 0;

  while (currentSize < targetSize) {
    // Add objects with toJSON methods
    container.simpleItems.push(new SimpleToJSON(counter));

    if (counter % 2 === 0) {
      container.nestedItems.push(new NestedToJSON(counter));
    }

    if (counter % 3 === 0) {
      container.complexItems.push(new ComplexToJSON(counter));
    }

    counter++;

    // Estimate size by stringifying
    currentSize = JSON.stringify(container).length;
  }

  return container;
}

// Generate by specific size names
function generateBySize(sizeName) {
  const sizes = {
    small: 230 * 1024,
    medium: 654 * 1024,
    large: 2.6 * 1024 * 1024,
    xlarge: 4.4 * 1024 * 1024,
  };

  const targetSize = sizes[sizeName];
  if (!targetSize) {
    throw new Error(`Unknown size: ${sizeName}`);
  }

  return generateToJSONHeavy(targetSize);
}

module.exports = {
  SimpleToJSON,
  NestedToJSON,
  ComplexToJSON,
  generateToJSONHeavy,
  generateBySize,
};
