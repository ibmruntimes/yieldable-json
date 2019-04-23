'use strict';

const yj = require('../index');
const tap = require('tap');

const RANDOM_STRING = 'abcdefghijklmnopqrstuvwxCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-=_+[]{}\\|;:\'",<.>/?`~';
const stringLength = Math.pow(2, 10);
const bigString = new Array(stringLength).fill(RANDOM_STRING).join('');
const arrayLength = Math.pow(2, 7);
const bigArray = new Array(arrayLength).fill(bigString);
let index = 0;
const objectSize = Math.pow(2, 2);
const bigObject = new Array(objectSize).fill(undefined).reduce((accumulator) => {
  accumulator[index] = bigArray;
  index++;
  return accumulator;
}, {});
const bigJSON = JSON.stringify(bigObject);
console.log('Object size', bigJSON.length);

let longestStarvation = 0;
let yieldCount = 0;
let time0 = Date.now();
const interval = setInterval(() => {
  yieldCount++;
  const time1 = Date.now();
  const elapsedTime = time1 - time0;
  time0 = time1;
  if (elapsedTime > longestStarvation) {
    longestStarvation = elapsedTime;
  }
}, 0);


// Make sure the API works well without the optional parameters.
const startTime = Date.now();
yj.parseAsync(bigJSON, (error, obj) => {
  const endTime = Date.now();
  console.log('Total time', endTime - startTime);
  if (error) {
    tap.fail(error);
  } else {
    tap.equal(yieldCount > 100, true, `Not enough yielding ${yieldCount}`);
    tap.equal(longestStarvation < 10, true, `Main thread starved too long ${longestStarvation}`);
  }
  clearInterval(interval);
});
