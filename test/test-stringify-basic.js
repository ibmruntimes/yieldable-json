'use strict';

const yj = require('../index');
const tap = require('tap');

const obj = {
  name: 'Jacqueline Poole',
  gender: 'female',
  age: 40,
  a: '"b"',
};

// Make sure the API works well without optional parameters
yj.stringifyAsync(obj, (err, str) => {
  if (!err)
    tap.equal(
      '{"name":"Jacqueline Poole","gender":"female","age":40,"a":"\\"b\\""}',
      str
    );
  else
    tap.fail(err);
});
