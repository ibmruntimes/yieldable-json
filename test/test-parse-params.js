'use strict';

const yj = require('../index');
const tap = require('tap');

const str = '{"name":"Ila Gould","age":40,"gender":"female"}';
var flag = false;

var reviver = (key, value) => {
  // Change the value if type is number
  if (typeof value === 'number')
    return value * 2;
  else return value;
};

// Make sure all the parameters can co-exist and the API
// can handle them gracefully.
yj.parseAsync(str, reviver, 2, (err, obj) => {
  if (!err) {
    tap.ok(flag, 'Unexpected Async-Behavior:' +
           ' callback was called synchronously');
    tap.equal('{"name":"Ila Gould","age":80,"gender":"female"}',
              JSON.stringify(obj));
  } else
    tap.fail(err);
});

flag = true;
