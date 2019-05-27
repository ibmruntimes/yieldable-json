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

const pa = require('./yieldable-parser');
const ps = require('./yieldable-stringify');

/**
 * Checks whether the provided space
 * @param { string or number } space
 * @return { string or number }
 */
let validateSpace = (space) => {
  if (typeof space === 'number') {
    space = Math.round(space);
    if (space >= 1 && space <= 10)
      return space;
    else if (space < 1)
      return 0;
    else
      return 10;
  } else {
    if (space.length <= 10)
      return space;
    else
    return space.substr(0, 9);
  }
};

/**
 * Checks whether the provided maxDuration
 * @param { number } maxDuration
 * @return { number }
 */
const validateDuration = (maxDuration) => {
  maxDuration = Math.round(maxDuration);
  if (maxDuration > 0 && maxDuration <= 60*60*1000)
    return maxDuration;
  else
    return 15;
};

module.exports = {

  /**
  * Error checking  and call of appropriate functions for JSON parse
  * @param { primitive data types } data
  * @param { function or array } reviver
  * @param { number } maxDuration
  * @param { function } callback
  * @return { function } parseWrapper
  */
  parseAsync(data, reviver, maxDuration, callback) {
    const argv = arguments;
    // Make sure last argument is callback
    if (typeof argv[argv.length - 1] === 'function' && argv.length > 1) {
      callback = argv[argv.length - 1];
    } else {
      throw new TypeError('Callback is not a function');
    }

    if (argv.length > 2) { // more than just just data and callback
      let i = argv.length - 2;
      if (typeof argv[i] === 'number') {
        maxDuration = validateDuration(argv[i]);
        i--;
      } else {
        maxDuration = undefined;
      }
      if (i > 0 && (typeof argv[i] === 'function' || Array.isArray(argv[i]))) {
        reviver = argv[i];
      } else {
        reviver = undefined;
      }
    } else {
      reviver = undefined;
      maxDuration = 15;
    }
    return pa.parseWrapper(data, reviver, maxDuration, callback);
  },

  /**
  * Error checking  and call of appropriate functions for JSON stringify API
  * @param { primitive data types } data
  * @param { function or array } replacer
  * @param { number or string } space
  * @param { number } maxDuration
  * @param { function } callback
  * @return { function } stringifyWrapper
  */
  stringifyAsync(data, replacer, space, maxDuration, callback) {
    const argv = arguments;

    // Make sure last argument is callback
    if (typeof argv[argv.length - 1] === 'function' && argv.length > 1) {
      callback = argv[argv.length - 1];
    } else {
      throw new TypeError('Callback is not a function');
    }

    if (argv.length > 2) { // more than just just data and callback
      let i = argv.length - 2;
      if (typeof argv[i] === 'number') {
        maxDuration = validateDuration(argv[i]);
        i--;
      } else {
        maxDuration = undefined;
      }
      if (i > 0 && (typeof argv[i] === 'number' || typeof argv[i] === 'string')) {
        space = validateSpace(argv[i]);
        i--;
      } else {
        space = undefined;
      }
      if (i > 0 && (typeof argv[i] === 'function' || Array.isArray(argv[i]))) {
        replacer = argv[i];
      } else {
        replacer = undefined;
      }
    } else {
      replacer = undefined;
      maxDuration = 15;
    }

    return ps.stringifyWrapper(data, replacer, space, maxDuration, callback);
  },
};
