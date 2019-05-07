'use strict';

const yj = require('../index');
const tap = require('tap');

//string with nested quotes
const str = '{"name":"Ila Gould","age":22,"gender":"female","nested":"\\"check\\""}';

yj.parseAsync(str, (error, obj) => {
  if (!error){
    tap.equal(str,JSON.stringify(obj));
    yj.stringifyAsync(obj,(err,data) => {
      if(!err){
        tap.equal(data,str);
      }
      else
        tap.fail(err);
     })
  }
  else
    tap.fail(error);
});
