//write more performant option for indexOf
//if more than 50k characters, use BHM Algorithm
//consider a big string to be 10k characters
const MAX_STRING_SIZE = 10000;

module.exports.indexOfGenerator = function* indexOfGenerator(stringInput, searchInput, initialIndex = 0) {
  if (!stringInput || !stringInput.length) {
    return -1;
  }
  stringInput = stringInput.slice(initialIndex);
  let innerAt = 0;
  let index = -1;
  while (true) {
    const at = Math.max(innerAt - 1, 0);
    const chunk = stringInput.slice(at, innerAt + MAX_STRING_SIZE);
    yield chunk;
    if (!chunk.length) {
      return index;
    }
    const indexOf = chunk.indexOf(searchInput);
    if (indexOf !== -1) {
      index = indexOf + at + initialIndex;
      yield index;
      return index;
    }
    innerAt += chunk.length + 1;
  }
}
