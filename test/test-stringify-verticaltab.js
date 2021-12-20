'use strict';

const yj = require('../index');
const tap = require('tap');

//Object with nested quotes
const obj = {
  name: 'Jacqueline Poole',
  gender: 'female',
  age: 40,
  a:"\vb"
};

yj.stringifyAsync(obj, (err, str) => {
  if (!err){
    tap.equal(JSON.stringify(obj), str);
    yj.parseAsync(str,(error,data) => {
      if(!error){
        tap.same(data,obj);
      }
      else
        tap.fail(error);
})
  }
  else
    tap.fail(err);
});
