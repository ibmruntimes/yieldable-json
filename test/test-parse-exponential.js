'use strict';

const tap = require('tap');
const yj = require('../index.js');

yj.parseAsync('1e+2', (err, res) => {
  if (!err) {
    tap.equal('100', JSON.stringify(res));
  } else {
    tap.fail(err);
  }
});

yj.parseAsync('1e-2', (err, res) => {
  if (!err) {
    tap.equal('0.01', JSON.stringify(res));
  } else {
    tap.fail(err);
  }
});
