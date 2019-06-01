// new 关键字主要操作步骤:
// 1. 定义一个空对象
// 2. 把空对象的原型指向构造函数原型
// 3. 绑定this为该空对象，执行构造造函
// 4. 如果构造函数返回一个新对象，则返回该新对象，否则返回原来的空对象

function _new(constructor, ...args) {
  if(typeof constructor !== 'function') throw new Error('contructor must be a function');
  let o = Object.create(null);
  o.__proto__ = constructor.prototype;
  let res = constructor.apply(o, args);
  return typeof res === 'object' && res !== null ? res : o;
}