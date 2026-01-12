'use strict';

const yj = require('../index');
const tap = require('tap');

class TestClass {
  constructor() {
    this.value = 4;
  }

  toJSON() {
    return {value: this.value};
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
