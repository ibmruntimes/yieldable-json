/* **************************************************************************
 * Dynamic Fixture Generator using Faker.js
 * Generates realistic test data on-the-fly before benchmarks run
 * Replaces static JSON fixture files with lightweight in-memory generation
 ***************************************************************************/
'use strict';

const { faker } = require('@faker-js/faker');

// Set seed for reproducible results
faker.seed(12345);

// Target sizes in bytes
const TARGET_SIZES = {
  small: 230 * 1024,
  medium: 654 * 1024,
  large: 2.6 * 1024 * 1024,
  xlarge: 4.4 * 1024 * 1024
};

// Generate nested object-heavy structure using Faker
function generateNestedObjects(targetSize) {
  const obj = {};
  let currentSize = 0;

  function addNestedLevel(parent, level, maxLevel = 10) {
    const keys = ['data', 'metadata', 'config', 'settings', 'options', 'params', 'info', 'details'];

    for (let i = 0; i < 8 && currentSize < targetSize; i++) {
      const key = `${keys[i % keys.length]}_${level}_${i}`;

      if (level < maxLevel) {
        parent[key] = {};
        currentSize += JSON.stringify({[key]: {}}).length;
        addNestedLevel(parent[key], level + 1, maxLevel);
      } else {
        // Use Faker to generate realistic leaf values
        parent[key] = {
          id: faker.string.uuid(),
          name: faker.person.fullName(),
          email: faker.internet.email(),
          description: faker.lorem.sentence(),
          timestamp: faker.date.past().toISOString(),
          active: faker.datatype.boolean()
        };
        currentSize += JSON.stringify({[key]: parent[key]}).length;
      }
    }
  }

  addNestedLevel(obj, 0);
  return obj;
}

// Generate array-heavy structure using Faker
function generateArrayHeavy(targetSize) {
  const arr = [];
  let currentSize = 0;

  while (currentSize < targetSize) {
    const subArray = [];
    for (let i = 0; i < 50; i++) {
      subArray.push({
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price()),
        description: faker.commerce.productDescription(),
        category: faker.commerce.department(),
        active: faker.datatype.boolean(),
        rating: faker.number.float({ min: 1, max: 5, precision: 0.1 }),
        tags: [
          faker.commerce.productAdjective(),
          faker.commerce.productAdjective(),
          faker.commerce.productAdjective()
        ],
        createdAt: faker.date.past().toISOString()
      });
    }
    arr.push(subArray);
    currentSize = JSON.stringify(arr).length;
  }

  return arr;
}

// Generate string-heavy structure using Faker
function generateStringHeavy(targetSize) {
  const obj = {
    records: []
  };
  let currentSize = 0;

  while (currentSize < targetSize) {
    obj.records.push({
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraphs(10, '\n\n'),
      description: faker.lorem.paragraphs(5, '\n\n'),
      author: faker.person.fullName(),
      bio: faker.lorem.paragraphs(3, '\n\n'),
      metadata: faker.lorem.paragraphs(2, '\n'),
      excerpt: faker.lorem.paragraph(),
      tags: faker.lorem.words(10),
      publishedAt: faker.date.past().toISOString()
    });
    currentSize = JSON.stringify(obj).length;
  }

  return obj;
}

// Generate mixed structure using Faker
function generateMixed(targetSize) {
  const obj = {
    users: [],
    products: [],
    orders: [],
    companies: [],
    posts: []
  };
  let currentSize = 0;
  let counter = 0;

  while (currentSize < targetSize) {
    // Add users
    obj.users.push({
      id: faker.string.uuid(),
      username: faker.internet.username(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      avatar: faker.image.avatar(),
      birthDate: faker.date.past({ years: 50 }).toISOString(),
      phone: faker.phone.number(),
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        zipCode: faker.location.zipCode(),
        country: faker.location.country()
      },
      jobTitle: faker.person.jobTitle(),
      company: faker.company.name()
    });

    // Add products
    obj.products.push({
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
      material: faker.commerce.productMaterial(),
      color: faker.color.human(),
      dimensions: {
        width: faker.number.float({ min: 1, max: 100 }),
        height: faker.number.float({ min: 1, max: 100 }),
        depth: faker.number.float({ min: 1, max: 100 })
      },
      inStock: faker.datatype.boolean(),
      sku: faker.string.alphanumeric(10).toUpperCase()
    });

    // Add orders
    obj.orders.push({
      id: faker.string.uuid(),
      orderNumber: faker.string.numeric(8),
      customerId: faker.string.uuid(),
      total: parseFloat(faker.commerce.price()),
      status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered']),
      items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        productId: faker.string.uuid(),
        quantity: faker.number.int({ min: 1, max: 10 }),
        price: parseFloat(faker.commerce.price())
      })),
      shippingAddress: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        zipCode: faker.location.zipCode()
      },
      createdAt: faker.date.past().toISOString()
    });

    // Add companies
    if (counter % 5 === 0) {
      obj.companies.push({
        id: faker.string.uuid(),
        name: faker.company.name(),
        catchPhrase: faker.company.catchPhrase(),
        bs: faker.company.buzzPhrase(),
        industry: faker.commerce.department(),
        employees: faker.number.int({ min: 10, max: 10000 }),
        founded: faker.date.past({ years: 50 }).getFullYear(),
        website: faker.internet.url(),
        email: faker.internet.email(),
        phone: faker.phone.number()
      });
    }

    // Add posts
    if (counter % 3 === 0) {
      obj.posts.push({
        id: faker.string.uuid(),
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraphs(5, '\n\n'),
        author: faker.person.fullName(),
        publishedAt: faker.date.past().toISOString(),
        views: faker.number.int({ min: 0, max: 100000 }),
        likes: faker.number.int({ min: 0, max: 10000 }),
        comments: Array.from({ length: faker.number.int({ min: 0, max: 10 }) }, () => ({
          id: faker.string.uuid(),
          author: faker.person.fullName(),
          text: faker.lorem.paragraph(),
          createdAt: faker.date.past().toISOString()
        }))
      });
    }

    counter++;
    currentSize = JSON.stringify(obj).length;
  }

  return obj;
}

// Generate toJSON-heavy structure using Faker
function generateToJSONHeavy(targetSize) {
  const obj = {
    items: []
  };
  let currentSize = 0;

  while (currentSize < targetSize) {
    // Simulate objects with toJSON methods
    obj.items.push({
      id: faker.string.uuid(),
      type: 'toJSON-simulated',
      user: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        profile: {
          bio: faker.lorem.paragraph(),
          website: faker.internet.url(),
          avatar: faker.image.avatar()
        }
      },
      metadata: {
        bool: faker.datatype.boolean(),
        number: faker.number.float({ min: 0, max: 1000, precision: 0.01 }),
        string: faker.lorem.sentence(),
        quoted: `"${faker.lorem.word()}"`,
        null: null,
        array: Array.from({ length: 5 }, () => faker.number.int({ min: 0, max: 100 })),
        nested: {
          value: {
            data: faker.datatype.boolean(),
            description: faker.lorem.paragraph(),
            count: faker.number.int({ min: 0, max: 1000 }),
            tags: faker.lorem.words(5).split(' ')
          }
        }
      },
      timestamp: faker.date.recent().toISOString(),
      tags: [
        faker.lorem.word(),
        faker.lorem.word(),
        faker.lorem.word()
      ]
    });

    currentSize = JSON.stringify(obj).length;
  }

  return obj;
}

// Generator mapping
const GENERATORS = {
  'nested-objects': generateNestedObjects,
  'array-heavy': generateArrayHeavy,
  'string-heavy': generateStringHeavy,
  'mixed': generateMixed,
  'toJSON-heavy': generateToJSONHeavy
};

/**
 * Generate test data dynamically
 * @param {string} sizeName - Size category: 'small', 'medium', 'large', 'xlarge'
 * @param {string} payloadType - Type of payload: 'nested-objects', 'array-heavy', 'string-heavy', 'mixed', 'toJSON-heavy'
 * @returns {Object} Generated data object
 */
function generateData(sizeName, payloadType) {
  const targetSize = TARGET_SIZES[sizeName];

  if (!targetSize) {
    throw new Error(`Unknown size: ${sizeName}. Valid sizes: ${Object.keys(TARGET_SIZES).join(', ')}`);
  }

  const generator = GENERATORS[payloadType];

  if (!generator) {
    throw new Error(`Unknown payload type: ${payloadType}. Valid types: ${Object.keys(GENERATORS).join(', ')}`);
  }

  // Reset faker seed for consistent results within same test run
  faker.seed(12345 + sizeName.charCodeAt(0) + payloadType.charCodeAt(0));

  return generator(targetSize);
}

/**
 * Get target size in bytes for a given size name
 * @param {string} sizeName - Size category
 * @returns {number} Target size in bytes
 */
function getTargetSize(sizeName) {
  return TARGET_SIZES[sizeName];
}

/**
 * Get all available size names
 * @returns {Array<string>} Array of size names
 */
function getSizeNames() {
  return Object.keys(TARGET_SIZES);
}

/**
 * Get all available payload types
 * @returns {Array<string>} Array of payload type names
 */
function getPayloadTypes() {
  return Object.keys(GENERATORS);
}

module.exports = {
  generateData,
  getTargetSize,
  getSizeNames,
  getPayloadTypes,
  TARGET_SIZES,
  GENERATORS
};
