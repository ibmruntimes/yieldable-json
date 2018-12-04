'use strict';

const yj = require('../index');
const tap = require('tap');

const str = '{"name":"Ila Gould","age":22,"gender":"female","nested":"\\"value\\""}';

// Make sure the API works well without the optional parameters.
yj.parseAsync(str, (err, obj) => {
  if (!err)
    tap.equal(str, JSON.stringify(obj));
  else
    tap.fail(err);
});
