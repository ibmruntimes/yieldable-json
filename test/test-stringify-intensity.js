'use strict';

const yj = require('../index');
const tap = require('tap');

var count = 0;
var flag = 0;
var i = 0;
var obj = [];
while (i < 2050) {
  obj.push(i++);
}

yj.stringifyAsync(obj, 0, 2, (err, str) => {
  if (!err) {
    tap.ok(flag >= 2, 'Async function was expected to yield 2 times,' +
           ' but it was not!');
  } else
    tap.fail(err);
});

function foo() {
  setTimeout(() => {
    count++;
    flag++;
    if (count === 100)
      return;
    foo();
  }, 0);
};

foo();
