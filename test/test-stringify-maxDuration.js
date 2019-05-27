'use strict';

const yj = require('../index');
const tap = require('tap');

var count = 0;
var i = 0;
var arr = [];
while (i < Math.pow(2, 20)) {
  arr.push(i++);
}
let timeout;

yj.stringifyAsync(arr, 1, 10, (err, str) => {
  clearTimeout(timeout);
  if (!err) {
    tap.ok(count >= 1, `Async function was expected to yield at least once, but got ${count}!`);
  } else
    tap.fail(err);
});

const foo = () => {
  return setTimeout(() => {
    count++;
    if (count > 10){
      clearTimeout(timeout);
      return;
    } else {
      foo();
    }
  }, 0);
};

timeout = foo();
