<p align="center">
  <a href="https://github.com/ibmruntimes/yieldable-json">
    <img height="257" width="114" src="https://user-images.githubusercontent.com/6447530/32721130-891d044a-c88b-11e7-9a6d-db062b55169d.png">
  </a>
  <p align="center">Asynchronous JSON.parse and JSON.stringify APIs</p>
</p>

# **yieldable-json**
This library provides asynchronous version of standard `JSON.parse` and `JSON.stringify` APIs.

### **Use Case**
Node.js based web applications dealing with large JSON objects while requiring high level of concurrency for the transactions.

Here '*largeness*' applies to any of, or all of, or any combination thereof deep compositions, large number of fields, and fields with large data (such as massive strings).

In contrast to `JSON Streams`, which are built with custom stream oriented protocols (at library as well as application level) and used in special use cases like data analytics, monitors, etc., `yieldable-json` works on fully formed JSON data that is characterized only by object size and designed with an objective of improving concurrency in the application and thereby usable in any workload scenarios.


----------


### **Statistics**
Testing with a wide range of data showed that objects which are bigger than `256KB` (when stringified) degrades concurrency in the application.

While definition of concurrency is subjective, a number of tests we performed in short and long round-trip networks showed that being available in the event loop for attending to concurrent requests at every `5 milliseconds` provides the required responsiveness to clients, as well as meets the overall concurrency expectation on the application.

<table>
  <tr>
    <th rowspan="2">Data Volume</th>
    <th colspan="2">Loop starvation (in milliseconds)</th>
  </tr>
  <tr>
    <td>JSON (built-in)</td>
    <td>yieldable-json</td>
  </tr>
  <tr>
    <td>115 KB</td>
    <td>2</td>
    <td>5</td>
  </tr>
  <tr>
<td>327 KB</td>
    <td>10</td>
    <td>5</td>
  </tr>
 <tr>
    <td>1.3 MB</td>
    <td>50</td>
    <td>5</td>
  </tr>
  <tr>
    <td>2.2 MB</td>
    <td>100</td>
    <td>5</td>
  </tr>
</table>

As shown in the table, the yieldable-json guarantees the event loop is reached and processed in every `5 ms`, irrespective of the JSON volume being processed.


----------


### **Background**
In Cloud based deployments, we foresee increase of JSON payload across distributed computing end-points in an exponential manner, causing performance bottleneck in the single-threaded node.js platform, and hence this attempt. The key function of asynchronous JSON APIs are to perform marshalling and un-marshalling of massive data incrementally, and yielding back to the application occasionally, and reduce loop starvation.

The ES6's generator function along with `yield` semantics is used for implementing incremental traversal. The extent of traversal in one iteration is controlled by the `intensity` parameter. While there are some `globally` accessible variables within main APIs, predominently the parser and stringifier is implemented through a self-recursing loop. The callback is guaranteed to fire no earlier than next tick to emulate the asynchronous behavior.

Because of the usage of ES6 semantics, this module is supported only on `node v4.x and above`.


--------


### **APIs**
***stringifyAsync***:

stringifyAsync(value[, replacer][, space][, intensity], callback)

* *`value`* <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> The javascript object which need to be converted to its equivalent JSON string.

* *`replacer`* `Optional` <[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)> | <[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)> As a function, it takes two parameters, the key and the value being stringified. The object in which the key was found is provided as the replacer's this parameter. Initially it gets called with an empty key representing the object being stringified, and it then gets called for each property on the object or array being stringified. It should return the value that should be added to the JSON string, as follows:

1. If you return a String, that string is used as the property's value when adding it to the JSON string.
2. If you return a Boolean, "true" or "false" is used as the property's value, as appropriate, when adding it to the JSON string.
3. If you return any other object, the object is recursively stringified into the JSON string, calling the replacer function on each property, unless the object is a function, in which case nothing is added to the JSON string.
4. If you return undefined, the property is not included (i.e., filtered out) in the output JSON string.

* *`toJSON() behavior`* If an object being stringified has a property named `toJSON` whose value is a function, then the `toJSON()` method customizes JSON stringification behavior: instead of the object being serialized, the value returned by the `toJSON()` method when called will be serialized.

* *`space`* `Optional` <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> | <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)> Used to insert white space into the output JSON string for readability purposes. If this is a Number, it indicates the number of space characters to use as white space; this number is capped at 10 (if it is greater, the value is just 10). Values less than 1 indicate that no space should be used. If this is a String, the string (or the first 10 characters of the string, if it's longer than that) is used as white space. If this parameter is not provided (or is null), no white space is used.

* *`intensity`* `Optional` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)> Takes the value between the range 1-32. This is used to compute the extent of traversal in the object tree in one iteration. The more the intensity, the more time will be spent in the stringify operation before it yields back to the uv loop. Its default value is 1.

* *`callback`* <[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)> Called with result when the stringify operation completes.
   * *`error`* <[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>
   * *`result`* <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> JSON value.
```sh
const yj = require('yieldable-json')
yj.stringifyAsync({key:"value"}, (err, data) => {
  if (!err)
    console.log(data)
})
```

Warning: While stringifyAsync is in progress (i.e. before the callback is executed), it is the user's responsibility to ensure that the Javascript object value (or any of its child objects) is not modified in any way. Object modification between the async function invocation and issuing of the completion callback may lead to undefined behavior (and can possibly result in an inadvertent crash or object corruption).

***parseAsync***:

parseAsync(text[, reviver][, intensity], callback)

* *`text`* <[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type)> The JSON string which needs to be parsed.

* *`reviver`* `Optional` <[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)> A function if specified, the value computed by parsing is transformed before being returned. Specifically, the computed value and all its properties (beginning with the most nested properties and proceeding to the original value itself) are individually run through the `reviver`. Then it is called, with the object containing the property being processed as this, and with the property name as a string, and the property value as arguments. If the `reviver` function returns undefined (or returns no value, for example, if execution falls off the end of the function), the property is deleted from the object. Otherwise, the property is redefined to be the return value.
If the `reviver` only transforms some values and not others, be certain to return all untransformed values as-is, otherwise they will be deleted from the resulting object.

* *`intensity`* `Optional` <[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type)> Takes the value between the range 1-32. This is used to compute the extent of traversal in the JSON string in one iteration. The more the intensity, the more time will be spent in the parse operation before it yields back to the uv loop. Its default value is 1.

* *`callback`* <[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function)> Called with result when the parsing operation completes.

   * *`error`* <[Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)>
   * *`result`* <[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)> JSON value.
```sh
const yj = require('yieldable-json')
yj.parseAsync('{"key":"value"}', (err, data) => {
  if (!err)
    console.log(data)
})
```

### GitHub Issues
This project uses GitHub Issues to track ongoing development and issues. Be sure
to search for existing bugs before you create another one. Contributions are always welcome!

- [https://github.com/ibmruntimes/yieldable-json/issues]( https://github.com/ibmruntimes/yieldable-json/issues)

### **Collaborators**

 * [bidipyne](https://github.com/bidipyne) -
**Bidisha Pyne** &lt;bidisha.pyne2015a@vit.ac.in&gt; (she/her)
 * [gireeshpunathil](https://github.com/gireeshpunathil) -
**Gireesh Punathil** &lt;gpunathi@in.ibm.com&gt; (he/him)
 * [HarshithaKP](https://github.com/HarshithaKP) -
**Harshitha K P** &lt;harshi46@in.ibm.com&gt; (she/her)
 * [LakshmiSwethaG](https://github.com/LakshmiSwethaG) -
**Lakshmi Swetha Gopireddy** &lt;lakshmiswethagopireddy@gmail.com&gt; (she/her)
 * [mhdawson](https://github.com/mhdawson) -
**Michael Dawson** &lt;michael_dawson@ca.ibm.com&gt; (he/him)
 * [sam-github](https://github.com/sam-github) -
**Sam Roberts** &lt;vieuxtech@gmail.com&gt; (he/him)
 * [sreepurnajasti](https://github.com/sreepurnajasti) -
**Sreepurna Jasti** &lt;sreepurna.jasti@gmail.com&gt; (she/her)
