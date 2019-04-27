/* **************************************************************************
 *
 * (c) Copyright IBM Corp. 2017
 *
 *  This program and the accompanying materials are made available
 *  under the terms of the Apache License v2.0 which accompanies
 *  this distribution.
 *
 *      The Apache License v2.0 is available at
 *      http://www.opensource.org/licenses/apache2.0.php
 *
 * Contributors:
 *   Multiple authors (IBM Corp.) - initial implementation and documentation
 ***************************************************************************/
'use strict';

const jsony = require('../index');
const tap = require('tap');
const fs = require('fs');
require('seedrandom');
const util = require('util');

const ARRAYMAX = 100;
const STRMAX = 10;
const OBJDEPTH = 32;
const PREDICATE = 100;
let seed = 0;

if (typeof process.argv[2] !== 'undefined')
  seed = process.argv[2];
else
  seed = Math.round(Math.random() * 100);

Math.seedrandom(seed);

let generateString = () => {

  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  // let escapee = ['\'', '\\', '/', '\b', '\f', '\n', '\r', '\t']
  let special = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')',
    '-', '_', '+', '='];
  let strlen = Math.round(Math.random() * STRMAX);
  for (let i = 0; i < strlen; i++) {
    text += possible.charAt(Math.round(Math.random() * possible.length));

    // TODO
    /*
    if (Math.round(Math.random() * PREDICATE) % escapee.length) {
      text += escapee[Math.round(Math.random() * escapee.length)]
      i++
    }
    */
    if (Math.round(Math.random() * PREDICATE) % 2) {
      text += special[Math.round(Math.random() * special.length)];
      i++;
    }
    // TODO
    /*
    if (Math.round(Math.random() * PREDICATE) % 2) {
      let uni = Math.round(Math.random() * 30)
      text += String.fromCharCode(parseInt(uni))
      i++
    }
    if (Math.round(Math.random() * PREDICATE) % 2) {
      let uni = Math.round(Math.floor() * 33) + 127
      text += String.fromCharCode(parseInt(uni))
      i++
    }
    if (Math.round(Math.random() * PREDICATE) % 2) {
      let uni = Math.round(Math.floor() * 5) + 1536
      text += String.fromCharCode(parseInt(uni))
      i++
    }
    */
  }
  return text;
};

let generateBool = () => {
  return !!Math.round(Math.random());
};

let generateObject = (depth) => {
  let obj = {};
  if (depth < 0)
    return null;
  let count = Math.round(Math.random() * ARRAYMAX);
  for (let i = 0; i < count; i++)
    obj[generateString()] = generateJson(--depth, 0);
  return obj;
};

let generateArray = (depth) => {
  let array = [];
  let element = null;
  if (depth < 0)
    element = null;
  let count = Math.round(Math.random() * ARRAYMAX);
  for (let i = 0; i < count; i++) {
    element = generateObject(--depth);
    if (element != null)
      array.push(element);
  }
  return array;
};

let generateJson = (depth, root) => {
  let num = Math.round(Math.random() * PREDICATE) % 5 + root;
  switch (num) {
    case 0:
      return generateString();
    case 1:
      return Math.round(Math.random() * 1.84467440737096E19);
    case 2:
      return generateBool();
    case 3:
      return null;
    case 4:
    case 5:
      return new Date(Math.random() * Date.now());
    case 6:
    case 8:
    case 9:
      return generateArray(--depth);
    case 7:
    case 10:
    case 11:
      return generateObject(--depth);
    default:
      return null;
  }
};

let print = (seed) => {
  console.log('Raise issue with https://github.com/ibmruntimes/yieldable-' +
              'json issues, along with these files.');
  console.log('Alternatively, you can diagnose this issue with the help of' +
              'these files.');
  console.log('Also use seeded number ' + seed + ' to debug futher.');
  console.log('Debug mode Usage: node test.js <seeded number>');
};

let sourceObj = generateJson(OBJDEPTH, 6);
let builtinStr = JSON.stringify(sourceObj);
let fileFound = `errFound.${process.pid}.${Date.now()}.txt`;
let fileWanted = `errWanted.${process.pid}.${Date.now()}.txt`;
jsony.stringifyAsync(sourceObj, function(err, oldStr) {
  if (err) {
    console.log('StringifyAsync Error: Test Failed');
    console.log('Error in StringifyAsync, Redirected to file: ' + fileFound);
    fs.writeFileSync(fileFound, util.inspect(err), 'utf-8');
    print(seed);
    return;
  }

  if (oldStr === builtinStr) {
    tap.pass('Test Passed');
  } else {
    console.log('StringifyAsync: Test Failed');
    console.log('Expected String Redirected to file: ' + fileWanted);
    fs.writeFileSync(fileWanted, oldStr);
    console.log('Actual String Redirected to file: ' + fileFound);
    fs.writeFileSync(fileFound, builtinStr);
    print(seed);
    return;
  }

  jsony.parseAsync(oldStr, function(errp, newObj) {
    if (errp) {
      console.log('ParseError: Test Failed');
      console.log('Error in Parse, Redirected to file: ' + fileFound);
      fs.writeFileSync(fileFound, util.inspect(errp), 'utf-8');
      print(seed);
      return;
    } else {
      jsony.stringifyAsync(newObj, function(errs, newStr) {
        if (errs) {
          console.log('StringifyAsync Error: Test Failed');
          console.log('Error in StringifyAsync, Redirected to file: ' +
                      fileFound);
          fs.writeFileSync(fileFound, util.inspect(errs), 'utf-8');
          print(seed);
          return;
        }

        if (newStr === builtinStr) {
          tap.pass('Test Passed');
        } else {
          console.log('ParseAsync: Test Failed');
          console.log('Expected String Redirected to file: ' + fileWanted);
          fs.writeFileSync(fileWanted, newStr);
          console.log('Actual String Redirected to file: ' + fileFound);
          fs.writeFileSync(fileFound, builtinStr);
          print(seed);
        }
      });
    }
  });
});
