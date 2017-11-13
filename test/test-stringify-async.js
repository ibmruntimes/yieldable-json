'use strict';

const yj = require('../index');
const tap = require('tap');

const obj = {
  name: 'Jacqueline Poole',
  gender: 'female',
};

let flag = false;

// Make sure the API is truely async and returns
// earliest by the next process tick
yj.stringifyAsync(obj, 0, 2, (err, str) => {
  if (!err){
    tap.ok(flag, 'Unexpected Async-Behavior: callback was called' +
           ' synchronously.');
  } else
    tap.fail(err);
});

flag = true;
