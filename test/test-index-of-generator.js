const tap = require('tap');
const { indexOfGenerator } = require('../utils/index-of-generator');

function promisifyGenerator(generator){
    return (...args) => {
        const gen = generator(...args);

        function handleNext(resolvedValue){
            if(resolvedValue.done){
                return Promise.resolve(resolvedValue.value);
            }
            return Promise.resolve(gen.next(resolvedValue.value)).then(handleNext);
        }
    
    
        return Promise.resolve(gen.next())
            .then((resolvedValue) => handleNext(resolvedValue), (error) => Promise.reject(gen.throw(error)));
    }
}

const asyncIndexOf = promisifyGenerator(indexOfGenerator);

const stringAsArray = ['s', 'o', 'm', 'e'];
const text = stringAsArray.join('');

tap.test('should return -1 if not found due to initialIndex', async () => {
    const index = await asyncIndexOf(text, 's', 1);
    const syncIndexOf = text.indexOf('s', 1);
    tap.equal(index, syncIndexOf);
})

tap.test('should return proper index', async () => {
    const index = await asyncIndexOf(text, 'e');
    const syncIndexOf = text.indexOf('e');
    tap.equal(index, syncIndexOf);
})

tap.test('should return proper test with initialIndex', async () => {
    const index = await asyncIndexOf(text, 'e', 2);
    const syncIndexOf = text.indexOf('e', 2);
    tap.equal(index, syncIndexOf);    
})

tap.test('should return correct indexOf if initialIndex is same', async () => {
    const index = await asyncIndexOf(text, 'e', 3);
    const syncIndexOf = text.indexOf('e', 3);
    tap.equal(index, syncIndexOf);    
})

tap.test('should return -1 if not found', async () => {
    const index = await asyncIndexOf(text, 'x');
    const syncIndexOf = text.indexOf('x');
    tap.equal(index, syncIndexOf);        
})
