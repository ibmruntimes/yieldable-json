'use strict';

const yj = require('../index');
const tap = require('tap');

const obj = {
  name: 'Jacqueline Poole',
  gender: 'female',
  age: 40,
};

const master  = {arr: [ { a: obj }, { b: obj} ] };

// Make sure presence of obj twice in the master
// object does not cause revisit issues while
// stringifying it - such as circular dependency

yj.stringifyAsync(obj, (err, str) => {
  if (!err) {
    tap.ok(true, 'Repeated object presence cause no issues');
  } else
    tap.fail(err);
});
