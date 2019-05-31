// Object.prototype.toString.call(obj) 可以返回 [object xxx] 形式的字符串
// 可以以此判断不同的类型

function isType (type) {
  return function (o) {
    return Object.prototype.toString.call(o) === `[object ${type}]`;
  }
}

const isArray = isType('Array');
const isNull = isType('Null');
const isNumber = isType('Number');
const isString = isType('String');
const isObject = isType('Object');
const isUndefined = isType('Undefined');
const isBoolean = isType('Boolean');
const isSymbol = isType('Symbol');

console.log(isArray([]));
console.log(isNull(null));
console.log(isNumber(12));
console.log(isString('123'));
console.log(isObject({}));
console.log(isUndefined(undefined));
console.log(isBoolean(false));
console.log(isSymbol(Symbol('a')));
// 全是true