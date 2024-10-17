'use strict';

const yj = require('../index');
const tap = require('tap');
const { readFileSync } = require('fs');
const str = readFileSync('./test/big-json-with-string.txt');
const nodeJSNativeParse = JSON.parse(str);

// Make sure the API works well without the optional parameters.
yj.parseAsync(str, (err, obj) => {
  if (!err)
    tap.equal(obj.text, nodeJSNativeParse.text, 'Failed to parse big string message - omitting logs', { diagnostic: false });
  else
    tap.fail(err);
});
