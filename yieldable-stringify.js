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

let counter = 0;
let objStack = [];
let temp = '';
const limit = 100000;

function StringifyError(m) {
  this.name = 'Error';
  this.message = m;
}

/**
 * Checking for unicode and backslash characters and replaces if any.
 * @param { string }
 * @return { string }
 */

let normalize = (string, flagN) => {
  let retStr = '';
  let transform = '';
  let uc =
  '/[\\\'\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4' +
  '\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g';
  let unicode = new RegExp(uc);
  // Taking '\\' out of the loop to avoid change in
  // order of execution of object entries resulting
  // in unwanted side effect
  string = string.replace(/\\/gi, '\\\\');
  let escape = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
  };
  // Escape is implemented globally
  for(var pattern in escape) {
    var regex = new RegExp(pattern,'gi')
    string = string.replace(regex, escape[pattern])
  }
  unicode.lastIndex = 0;
  if (unicode.test(string)) {
    // Unicode logic here
    transform = string.replace(unicode, (a) => {
      return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    });
    if (flagN === 1) {
      transform += temp;
      transform += transform;
      temp = '';
      return '"' + transform + '"';
    } else if (flagN === 2) {
      return '"' + transform + '"';
    } else {
      temp += transform;
    }
  } else {
    if (flagN === 1) {
      retStr += temp;
      retStr += string;
      temp = '';
      return '"' + retStr + '"';
    } else if (flagN === 2) {
      return '"' + string + '"';
    } else {
      temp += string;
      return;
    }
  }
};

/**
 * Obtain stringified value by yielding at required intensity
 * @param { string} field
 * @param { primitive data type } container
 * @param { function or array } replacer
 * @param { number or string } space
 * @param { number } intensity
 * @return { function } yieldCPU
 */

function * stringifyYield(field, container, replacer, space, intensity) {
  let itr = 0;
  let key = '';
  let val = '';
  let length = 0;
  let tempVal = '';
  let result = '';
  let value = container[field];
  // Made scope local handling async issues
  let flag1 = 0;
  let returnStr = '';
  let subStr = '';
  let len = 0;

  // Yield the stringification at definite intervals
  if (++counter > 512 * intensity) {
    counter = 0;
    yield val;
  }

  // Call replacer if one is present (SPEC)
  if (typeof replacer === 'function') {
    value = replacer.call(container, field, value);
  }

  switch (typeof value) {
    case 'string':
      if (value.length > limit) {
        for (let l = 0; l < value.length; l += limit) {
          flag1 = 0;
          yield value;
          subStr = value.substr(l, limit);
          len += subStr.length;
          if (len === value.length)
            flag1 = 1;
          returnStr = normalize(subStr, flag1);
        }
      } else
        returnStr = normalize(value, 2);
      return returnStr;
    case 'number':
      return isFinite(value)
        ? String(value)
        : 'null';
    case 'boolean':
    case 'null':
      return String(value);
    case 'undefined':
      return;
    case 'object':
      if (!value)
        return 'null';

    // Manage special cases of Arrays and Objects
      let getResult = (decision) => {
        if (result.length === 0)
          if (decision)
            return '{}';
          else
          return '[]';
        else
        if (decision)
          if (space)
            return '{\n' + space + result.join(',\n' + space) + '\n' + '}';
          else
            return '{' + result.join(',') + '}';
        else
          if (space)
            return '[\n' + space + result.join(',\n' + space) + '\n' + ']';
          else
            return '[' + result.join(',') + ']';
      };

      result = [];
    // If toJSON is present, invoke it (SPEC)
      if (value && typeof value.toJSON === 'function') {
        result.push('"' + value.toJSON(field) + '"');
        if (result.length === 0)
          return '{}';
        else
        if (space)
          return space + result.join(',\n' + space) + '\n';
        else
          return result.join(',');
      }
    // Array case
      if (value && value.constructor === Array) {
        length = value.length;
        for (itr = 0; itr < length; itr += 1) {
          tempVal =
          yield *stringifyYield(itr, value, replacer, space, intensity) ||
          'null';
          if (tempVal !== undefined)
            result.push(tempVal);
        }
        return getResult(false);
      }

    // Manage replacing object scenario (SPEC)
      if (replacer && typeof replacer === 'object') {
        length = replacer.length;
        for (itr = 0; itr < length; itr += 1) {
          if (typeof replacer[itr] === 'string') {
            key = replacer[itr];
            val = yield *stringifyYield(key, value, replacer, space, intensity);
            if (val !== undefined)
              result.push(normalize(key, 2) + (space
              ? ': '
              : ':') + val);
          }
        }
      } else {
      // Object case
        objStack.push(value);
        for (key in value) {
          if (typeof value[key] === 'object' && value[key] !== null &&
          value[key] !== undefined) {
            if (objStack.indexOf(value[key]) !== -1) {
              return new StringifyError('Circular Structure Detected');
            } else
            objStack.push(value[key]);
          }
          if (Object.hasOwnProperty.call(value, key)) {
            val = yield *stringifyYield(key, value, replacer, space, intensity);
            if (val !== undefined)
              result.push(normalize(key, 2) + (space
              ? ': '
              : ':') + val);
          }
          objStack = objStack.filter((v, i, a) => { return v !== value[key] });
        }
        objStack = objStack.filter((v, i, a) => { return v !== value });
      }
      return getResult(true);
    default:
      return new StringifyError('Unexpected Character');
  }
}

/**
 * Calling appropriate functions each time.
 * @param { primitive data types } value
 * @param { function or array } replacer
 * @param { number or string } space
 * @param { number } intensity
 * @param { function } callback
 * @return { function } yieldCPU
 */

let stringifyWrapper = (value, replacer, space, intensity, callback) => {
  let indent = '';
  if (typeof space === 'number') {
    indent = ' '.repeat(space);
  } else if (typeof space === 'string') {
    indent = space;
  }

  let yielding;

  // To hold 'stringifyYield' genarator function
  function * yieldBridge() {
    yielding = yield *stringifyYield('', {'': value}, replacer, indent, 1);
  }

  let rs = yieldBridge();
  let g = rs.next();

  let yieldCPU = () => {
    setImmediate(() => {
      g = rs.next();
      if (g && g.done === true) {
        // Reinitializing the values at the end of API call
        counter = 0;
        temp = ''
        objStack = [];
        if (typeof yielding === 'object')
          return callback(yielding, null);
        else
          return callback(null, yielding);
      }
      yieldCPU();
    });
  };
  return yieldCPU();
};

exports.stringifyWrapper = stringifyWrapper;
