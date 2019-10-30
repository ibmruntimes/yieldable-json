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

/**
 * This method parses a JSON text to produce an object or array.
 * It can throw a SyntaxError exception, if the string is malformed.
 * @param { string } text
 * @param { function or array } reviver
 * @param { number } intensity
 * @param { function } cb
 * @return { function } yieldCPU
 */
let parseWrapper = (text, reviver, intensity, cb) => {
  let counter = 0;
  let keyN = 0;
  let parseStr = text;
  let at = 0;
  let ch = ' ';
  let word = '';
  function ParseError(m) {
    this.name = 'ParseError';
    this.message = m;
    this.text = parseStr;
  }

  // Seek to the next character, after skipping white spaces, if any.
  let seek = () => {
    ch = parseStr.charAt(at);
    at++;
    while (ch && ch <= ' ') {
      seek();
    }
    return ch;
  };

  // Seek to the previous character, required in some special cases.
  let unseek = () => {
    ch = parseStr.charAt(--at);
  };

  // Match 'true', 'false' and  'null' built-ins.
  let wordCheck = () => {
    word = '';
    do {
      word += ch;
      seek();
    } while (ch.match(/[a-z]/i));
    parseStr = parseStr.slice(at - 1);
    at = 0;
    return word;
  };

  // Process strings specially.
  let normalizeUnicodedString = () => {
    let inQuotes = ' ';
    let tempIndex = at;
    let index = 0;
    let slash = 0;
    let c = '"';
    while (c) {
      index = parseStr.indexOf('"', tempIndex + 1);
      tempIndex = index;
      ch = parseStr.charAt(tempIndex - 1);
      while (ch === '\\') {
        slash++;
        ch = parseStr.charAt(tempIndex - (slash + 1));
      }
      if (slash % 2 === 0) {
        inQuotes = parseStr.substring(at, index);
        parseStr = parseStr.slice(++index);
        slash = 0;
        break;
      } else
        slash = 0;
    }

    // When parsing string values, look for " and \ characters.
    index = inQuotes.indexOf('\\');
    while (index >= 0) {
      let escapee = {
        '"': '"',
        '\'': '\'',
        '/': '/',
        '\\': '\\',
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t',
      };
      let hex = 0;
      let i = 0;
      let uffff = 0;
      at = index;
      ch = inQuotes.charAt(++at);
      if (ch === 'u') {
        uffff = 0;
        for (i = 0; i < 4; i += 1) {
          hex = parseInt(ch = inQuotes.charAt(++at), 16);
          if (!isFinite(hex)) {
            break;
          }
          uffff = uffff * 16 + hex;
        }
        inQuotes = inQuotes.slice(0, index) +
                   String.fromCharCode(uffff) + inQuotes.slice(index + 6);
        at = index;
      } else if (typeof escapee[ch] === 'string') {
        inQuotes = inQuotes.slice(0, index) +
                   escapee[ch] + inQuotes.slice(index + 2);
        at = index + 1;
      } else
        break;
      index = inQuotes.indexOf('\\', at);
    }
    at = 0;
    return inQuotes;
  };

  /**
  * This function parses the current string and returns the JavaScript
  * Object, through recursive method, and yielding back occasionally
  * based on the intensity parameter.
  * @return { object } returnObj
  */
  function * parseYield() {
    let key = '';
    let returnObj = {};
    let returnArr = [];
    let v = '';
    let inQuotes = '';
    let num = 0;
    let numHolder = '';
    let addup = () => {
      numHolder += ch;
      seek();
    };
    // Handle premitive types. eg: JSON.parse(21)
    if (typeof parseStr === 'number' || typeof parseStr === 'boolean' ||
        parseStr === null) {
      parseStr = '';
      return text;
    } else if (typeof parseStr === 'undefined') {
      parseStr = undefined;
      return text;
    } else if (parseStr.charAt(0) === '[' && parseStr.charAt(1) === ']') {
      parseStr = '';
      return [];
    } else if (parseStr.charAt(0) === '{' && parseStr.charAt(1) === '}') {
      parseStr = '';
      return {};
    } else {
      // Yield the parsing work at specified intervals.
      if (++counter > 512 * intensity) {
        counter = 0;
        yield;
      }
      // Common case: non-premitive types.
      if (keyN !== 1)
        seek();
      switch (ch) {
        case '{':
        // Object case
          seek();
          if (ch === '}') {
            parseStr = parseStr.slice(at);
            at = 0;
            return returnObj;
          }
          do {
            if (ch !== '"')
              seek();
            keyN = 1;
            key = yield *parseYield();
            keyN = 0;
            seek();
            returnObj[key] = yield *parseYield();
            seek();
            if (ch === '}') {
              parseStr = parseStr.slice(at);
              at = 0;
              return returnObj;
            }
          } while (ch === ',');
          return new ParseError('Bad object');
        case '[':
        // Array case
          seek();
          if (ch === ']') {
            parseStr = parseStr.slice(at);
            at = 0;
            return returnArr;
          }
          unseek();
          do {
            v = yield *parseYield();
            returnArr.push(v);
            seek();
            if (ch === ']') {
              parseStr = parseStr.slice(at);
              at = 0;
              return returnArr;
            }
          } while (ch === ',');
          return new ParseError('Bad array');
        case '"':
          parseStr = parseStr.slice(at - 1);
          at = 0;
          if (parseStr.charAt(0) === '"' && parseStr.charAt(1) === '"') {
            parseStr = parseStr.slice(2);
            at = 0;
            return inQuotes;
          } else {
            seek();
            return normalizeUnicodedString();
          }
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '-':
          if (ch === '-') addup();
          do {
            addup();
            if (ch === '.' || ch === 'e' || ch === 'E' ||
              ch === '-' || ch === '+' ||
              (ch >= String.fromCharCode(65) &&
              ch <= String.fromCharCode(70)))
              addup();
          } while (ch === '-' || ch === '+' || (isFinite(ch) && ch !== ''));
          num = Number(numHolder);
          parseStr = parseStr.slice(at - 1);
          at = 0;
          return num;
        case 't':
          word = wordCheck();
          if (word === 'true')
            return true;
          else return new ParseError('Unexpected character');
        case 'f':
          word = wordCheck();
          if (word === 'false')
            return false;
          else return new ParseError('Unexpected character');
        case 'n':
          word = wordCheck();
          if (word === 'null')
            return null;
          else return new ParseError('Unexpected character');
        default:
          return new ParseError('Unexpected character');
      }
    }
  }

  /**
   * If there is a reviver function, we recursively walk the new structure,
   * passing each name/value pair to the reviver function for possible
   * transformation, starting with a temporary root object that holds the result
   * in an empty key. If there is not a reviver function, we simply return the
   * result.
   * @param { object } yieldedObject
   * @param { string } key
   * @return { function } reviver
   */
  let revive = (yieldedObject, key) => {
    let k = '';
    let v = '';
    let val = yieldedObject[key];
    if (val && typeof val === 'object') {
      for (k in val) {
        if (Object.prototype.hasOwnProperty.call(val, k)) {
          v = revive(val, k);
          if (v !== undefined)
            val[k] = v;
          else
            delete val[k];
        }
      }
    }
    return reviver.call(yieldedObject, key, val);
  };

  let yielding = '';
  // To hold 'parseYield' genarator function
  function * yieldBridge() {
    yielding = yield* parseYield();
  }
  let rs = yieldBridge();
  let gen = rs.next();

  // Main yield control logic.
  let yieldCPU = () => {
    setImmediate(() => {
      gen = rs.next();

      if (gen && gen.done === true) {
        let isEmpty = (value) => {
          if (value.charAt(0) === '}' || value.charAt(0) === ']')
            value = value.substring(1, value.length);
          return typeof value === 'string' && !value.trim();
        };
        if (typeof yielding === 'undefined')
          return cb(new ParseError('Unexpected Character'), null);
        else if (yielding instanceof ParseError)
          return cb(yielding, null);
        else if (!isEmpty(parseStr))
          return cb(new ParseError('Unexpected Character'), null);
        else {
          if (reviver !== null) {
            if (typeof reviver === 'function') {
              let result = revive({'': yielding}, '');
              return cb(null, result);
            }
          } else
            return cb(null, yielding);
        }
      }
      yieldCPU();
    });
  };
  return yieldCPU();
};

exports.parseWrapper = parseWrapper;
