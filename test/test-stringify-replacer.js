'use strict';

const yj = require('../index');
const tap = require('tap');

const objData = {
  name: 'Jacqueline Poole',
  gender: 'female',
  age: 40,
};

// Replacer function which just returns non-string type values
let replacer = (key, value) => {
  if (typeof value === 'string')
    return undefined;
  return value;
};

// Make sure the API is working just with replacer function.
yj.stringifyAsync(objData, replacer, (err, strData) => {
  if (!err)
    tap.equal('{"age":40}', strData);
  else
    tap.fail(err);
});
