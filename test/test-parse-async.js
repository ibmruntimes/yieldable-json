'use strict';

const yj = require('../index');
const tap = require('tap');

const str = '{"name":"Ila Gould","age":22,"gender":"female"}';
let flag = false;

yj.parseAsync(str, (err, obj) => {
  if (!err) {
    tap.ok(flag, 'Unexpected Async Behavior:' +
           ' callback called synchronously');
  } else
    tap.fail(err);
});

flag = true;
