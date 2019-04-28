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
 * Checks whether the provided intensity
 * @param { number } intensity
 * @return { number }
 */
let validateIntensity = (intensity) => {
  intensity = Math.round(intensity);
  if (intensity > 0 && intensity <= 32)
    return intensity;
  else if (intensity <= 0)
    return 1;
  else
    return 32;
};

module.exports = {

  /**
  * Error checking  and call of appropriate functions for JSON parse
  * @param { primitive data types } data
  * @param { function or array } reviver
  * @param { number } intensity
  * @param { function } callback
  * @return { function } parseWrapper
  */
  parseAsync(data, reviver, intensity, callback) {
    const argv = arguments;

    //Bring parity with the in-built parser, that takes both string and buffer
    if(Buffer.isBuffer(data))
      data = data.toString();

    if (argv.length < 2)
      throw new Error('Missing Callback');

    if (typeof argv[argv.length - 1] === 'function') {
      callback = argv[argv.length - 1];
      reviver = null;
      intensity = 1;
    } else
      throw new TypeError('Callback is not a function');

    if (argv.length > 2) {
      let i = 1;
      if (typeof argv[i] === 'function')
        reviver = argv[i++];
      if (typeof argv[i] === 'number')
        intensity = validateIntensity(argv[i]);
    }
    return pa.parseWrapper(data, reviver, intensity, callback);
  },

  /**
  * Error checking  and call of appropriate functions for JSON stringify API
  * @param { primitive data types } data
  * @param { function or array } replacer
  * @param { number or string } space
  * @param { number } intensity
  * @param { function } callback
  * @return { function } stringifyWrapper
  */
  stringifyAsync(data, replacer, space, intensity, callback) {
    const argv = arguments;
    if (typeof argv[argv.length - 1] === 'function') {
      callback = argv[argv.length - 1];
      replacer = null;
      intensity = 1;
    } else
      throw new TypeError('Callback is not a function');
    if (argv.length > 2) {
      let i = 1;
      if (typeof argv[i] === 'function' || typeof argv[i] === 'object')
        replacer = argv[i++];
      if ((typeof argv[i] === 'number' || typeof argv[i] === 'string') &&
           typeof argv[i++] === 'number')
        space = validateSpace(argv[i++]);
      if (typeof argv[i] === 'number')
        intensity = validateIntensity(argv[i]);
    }
    return ps.stringifyWrapper(data, replacer, space, intensity, callback);
  },
};
