'use strict';

const yj = require('../index');
const tap = require('tap');

var count = 0;
var flag = 0;
var i = 0;
var arr = [];
while (i < 2050) {
  arr.push(i++);
}
var str = JSON.stringify(arr);

yj.parseAsync(str, 2, (err, obj) => {
  if (!err) {
    tap.ok(flag >= 1, 'Async function was expected to yield' +
           ` at least once, but got ${flag}!`);
  } else
    tap.fail(err);
});

function foo() {
  setTimeout(() => {
    count++;
    flag++;
    if (count === 1000)
      return;
    foo();
  }, 0);
};

foo();
