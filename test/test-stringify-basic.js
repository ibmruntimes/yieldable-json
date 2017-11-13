'use strict';

const yj = require('../index');
const tap = require('tap');

const obj = {
  name: 'Jacqueline Poole',
  gender: 'female',
  age: 40,
};

// Make sure the API works well without optional parameters
yj.stringifyAsync(obj, (err, str) => {
  if (!err)
    tap.equal('{"name":"Jacqueline Poole","gender":"female","age":40}', str);
  else
    tap.fail(err);
});
