const yj = require('../index.js')
const tap = require('tap')

const child = {}
const obj = {child}

yj.stringifyAsync({obj}, (err, res) => {
  if(!err) {
    tap.equal(JSON.stringify({obj}), res)
  }
  else {
    tap.fail(err)
  }
  yj.stringifyAsync({obj}, (err, res) => {
    if(!err) {
      tap.equal(JSON.stringify({obj}), res)
    }
    else {
      tap.fail(err)
    }
  })
})
