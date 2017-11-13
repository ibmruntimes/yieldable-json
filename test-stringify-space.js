'use strict';

const yj = require('../index');
const tap = require('tap');

const obj = {
  name: 'Jacqueline Poole',
  gender: 'female',
  age: 40,
};

// Make sure the API is working just with space parameter
yj.stringifyAsync(obj, null, '\n', (err, str) => {
  if (!err)
    tap.equal('{\n\n"name": "Jacqueline Poole",\n\n"gender":' +
              ' "female",\n\n"age": 40\n}', str);
  else
    tap.fail(err);
});
