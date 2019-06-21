const yj = require('../index.js');
const tap = require('tap');
const obj = '{"obj":{"child":{}}}'
yj.parseAsync(obj,(err,res) => {
 if(!err) {
   tap.equal(obj, JSON.stringify(res));
 }
 else {
   tap.fail(err);
 }
 yj.parseAsync(obj,(err,res) => {
   if(!err) {
     tap.equal(obj, JSON.stringify(res));
   }
   else {
     tap.fail(err);
   }
 })
})
