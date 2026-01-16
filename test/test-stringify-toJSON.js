'use strict';

const yj = require('../index');
const tap = require('tap');

class TestClass {
  constructor() {
    this.bool = true;
    this.number = 4;
    this.string = 'string';
    this.quoted = '"quoted"';
    this.null = null;
  }

  toJSON() {
    return {
      bool: this.bool,
      number: this.number,
      string: this.string,
      quoted: this.quoted,
      null: this.null,
    };
  }
}

// class with value and custom toJSON method
const test = new TestClass();

yj.stringifyAsync(test, (err, str) => {
  if (!err){
    tap.equal(JSON.stringify(test), str);
    yj.parseAsync(str, (error, data) => {
      if (!error){
        tap.deepEquals(data, test);
      } else {
        tap.fail(error);
      }
    });
  } else {
    tap.fail(err);
  }
});

class TestNestedClass {
  constructor() {
    this.value = {data: true, string: 'test', number: 42, array: [1, 2, 3]};
  }

  toJSON() {
    return {value: this.value};
  }
}

// class with various nested values and custom toJSON method
const testNested = new TestNestedClass();

yj.stringifyAsync(testNested, (err, str) => {
  if (!err){
    tap.equal(JSON.stringify(testNested), str);
    yj.parseAsync(str, (error, data) => {
      if (!error){
        tap.deepEquals(data, testNested);
      } else {
        tap.fail(error);
      }
    });
  } else {
    tap.fail(err);
  }
});
