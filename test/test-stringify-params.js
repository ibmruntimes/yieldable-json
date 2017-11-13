'use strict';

const yj = require('../index');
const tap = require('tap');

const obj = {
  name: 'Jacqueline Poole',
  gender: 'female',
  age: 40,
};

let flag = false;

// Replacer function which just returns non-string type values
let replacer = (key, value) => {
  if (typeof value === 'string')
    return undefined;
  return value;
};

// Make sure all the parameters can co-exist
// and the API can handle them gracefully.
yj.stringifyAsync(obj, replacer, 2, 2, (err, str) => {
  if (!err) {
    tap.ok(flag, 'Unexpected Async-Behavior:' +
           ' callback was called synchronously');
    tap.equal('{\n  "age": 40\n}', str);
  } else
    tap.fail(err);
});

flag = true;
