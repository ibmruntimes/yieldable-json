'use strict';

const yj = require('../index');
const tap = require('tap');

const str =
  '{"name":"Ila Gould","age":22,"gender":"female"}';

var reviver = (key, value) => {
  // Change the value if type is number
  if (typeof value === 'number')
    return value * 2;
  return value;
};

// Make sure the API works just with reviver param
yj.parseAsync(str, reviver, (err, obj) => {
  if (!err)
    tap.equal('{"name":"Ila Gould","age":44,"gender":"female"}',
              JSON.stringify(obj));
  else
    tap.fail(err);
});
