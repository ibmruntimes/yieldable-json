'use strict';

const yj = require('../index');
const tap = require('tap');

// 1. Set up really big JSON object
const RANDOM_STRING = 'abcdefghijklmnopqrstuvwxCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-=_+[]{}\\|;:\'",<.>/?`~';
const stringLength = Math.pow(2, 4);
const bigString = new Array(stringLength).fill(RANDOM_STRING).join('');
const arrayLength = Math.pow(2, 8);
const bigArray = new Array(arrayLength).fill(bigString);
let index = 0;
const objectSize = Math.pow(2, 10);
const bigObject = new Array(objectSize).fill(undefined).reduce((accumulator) => {
  accumulator[index] = bigArray;
  index++;
  return accumulator;
}, {});
const bigJSON = JSON.stringify(bigObject);
// console.log('Object size', bigJSON.length * 16, 'bytes');

// 2. Measure how long it takes regular JSON.parse
const nonYieldParseTime0 = Date.now();
JSON.parse(bigJSON);
const nonYieldParseTime1 = Date.now();
const nonYieldParseElapsedTime = nonYieldParseTime1 - nonYieldParseTime0;

// 3. Set up a measure of how long a single tick blocks for. Uses async-hooks
const blocked = require('blocked-at');
let longestTickTime = 0;
let longestTickStack;
blocked((blockTime, stack) => {
  blockTime = parseInt(blockTime, 10); // eslint-disable-line no-param-reassign
  if (blockTime > longestTickTime) {
    longestTickTime = blockTime;
    longestTickStack = stack;
  }
});

// 4. Set up a measure of how often the node loop runs and how long between runs (max)
let longestLoopStarvation = 0;
let yieldCount = 0;
let time0 = Date.now();
const interval = setInterval(() => {
  yieldCount++;
  const time1 = Date.now();
  const elapsedTime = time1 - time0;
  time0 = time1;
  if (elapsedTime > longestLoopStarvation) {
    longestLoopStarvation = elapsedTime;
  }
}, 0);

const yieldParseTime0 = Date.now();
yj.parseAsync(bigJSON, (error, obj) => {
  // 5. Measure how long yj.parseAsync takes
  const yieldParseTime1 = Date.now();
  const yieldParseElapsedTime = yieldParseTime1 - yieldParseTime0;
  // console.log('Total time', yieldParseElapsedTime);
  // console.log('yieldCount', yieldCount);
  // console.log('longestLoopStarvation', longestLoopStarvation);
  // console.log('longestTickTime', longestTickTime);

  if (error) {
    tap.fail(error);
  } else {
    tap.equal(yieldParseElapsedTime / 10 < nonYieldParseElapsedTime, true, `Yieldable parse took 10x longer than regular parse ${yieldParseElapsedTime} vs ${nonYieldParseElapsedTime}`);
    tap.equal(yieldCount > 10, true, `Not enough yielding ${yieldCount}`);
    tap.equal(longestLoopStarvation < 100, true, `Loop starved too long ${longestLoopStarvation}`);
    setTimeout(() => { // need 2 loops for blocked-at to call-back for some reason...
      setTimeout(() => {
        tap.equal(longestTickTime < 100, true, `Tick took too long ${longestTickTime}`);
        // Will print what took that lon
        // console.log(longestTickStack);
      });
    });
  }
  clearInterval(interval);
});
