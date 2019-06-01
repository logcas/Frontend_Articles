# JavaScript 日常技巧

## 1. 判断对象的数据类型

```js
function isType (type) {
  return function (o) {
    return Object.prototype.toString.call(o) === `[object ${type}]`;
  }
}

const isArray = isType('Array');
console.log(isArray([])); // true
```

## 2. ES5 实现数组 map 方法

```js
function _map(arr, fn = v => v) {
  if(!Array.isArray(arr)) {
    throw new Error('arr is not array');
  }
  let res = [];
  for(let i = 0;i < arr.length; ++i) {
    res[i] = fn(arr[i]);
  }
  return res;
}
```

## 3. 使用 reduce 实现数组 map 方法

```js
Array.prototype._map = function(fn = v => v) {
  return this.reduce((pre, cur) => [...pre, fn(cur)], []);
}

let a = [1, 2, 3, 4, 5];
let b = a._map(v => v * v);
console.log(b); // [1, 4, 9, 16, 25]
```

## 4. ES5 实现数组 filter 方法

```js
Array.prototype._filter = function(fn) {
  if(typeof fn !== 'function') throw new Error('fn must be a function');
  let res = [];
  for(let i = 0;i < this.length; ++i) {
    if(fn(this[i])) res.push(this[i]);
  }
  return res;
}

let a = [1, 2, 3, 4, 5, 6];
let b = a._filter(v => !!(v & 1)); // 过滤偶数
console.log(b); // [1, 3, 5]
```

## 5. 使用 reduce 实现数组 filter 方法

```js
Array.prototype._filter = function(fn) {
  return this.reduce((pre, cur) => fn(cur) ? [...pre, cur] : pre, []);
}

let a = [1, 2, 3, 4, 5, 6];
let b = a._filter(v => !!(v & 1)); // 过滤偶数
console.log(b); // [1, 3, 5]
```

## 6. ES5 实现数组的 some 方法

```js
Array.prototype._some = function(fn) {
  for(let i = 0;i < this.length; ++i) {
    if(fn(this[i])) return true;
  }
  return false;
}

let a = [1, 2, 3, 4, 5];
let b = [2, 4, 6, 8, 10];
console.log(a._some(v => !!(v & 1))); // true
console.log(b._some(v => !!(v & 1))); // false

```

## 7. ES5 实现数组的 reduce 方法

```js
Array.prototype._reduce = function(fn, init) {
  let pre = init;
  for(let i = 0;i < this.length; ++i) {
    pre = fn(pre, this[i]);
  }
  return pre;
}

let a = [1, 2, 3, 4, 5];
let reduce_a = a._reduce((pre, cur) => pre + cur, 0);
console.log(reduce_a); // 15
```

## 8. 使用 reduce 实现数组的 flat

```js
function flat(array) {
  return array.reduce((pre, cur) => Array.isArray(cur) ? [...pre, ...flat(cur)] : [...pre, cur], []);
}

let a = [1, 2, [3, 4, 5, [7, 8, 9, [10]]]];
let b = flat(a);
console.log(b); // [ 1, 2, 3, 4, 5, 7, 8, 9, 10 ]
```

## 9. 实现 ES6 的 class 继承语法

```js
function inherit(subType, superType) {
  subType.prototype = Object.create(superType, {
    constructor: {
      configurable: true,
      writable: true,
      enumerable: false,
      value: subType
    }
  });
  // subType.__proto__ = superType;
  // 这里主要是为了继承构造函数上的静态方法和属性
  Object.setPrototypeOf(subType, superType);
}
```

## 10. 函数柯里化

```js
function currying(fn, ...args) {
  let len = fn.length;
  const generator = function(...genArgs) {
    args = [...args, ...genArgs];
    if(args.length >= len) {
      return fn.apply(this, args);
    } else {
      return generator;
    }
  }
  return generator;
}

function add(a, b, c, d) {
  return a + b + c + d;
}

let curryingAdd = currying(add, 1);
let r = curryingAdd(2)(3)(4);
console.log(r); // 10
```

## 11. 函数柯里化（支持占位符）

占坑

## 12. 偏函数

```js
function partialFunc(fn, ...args) {
  let placeholderNums = 0;
  return function(...args2) {
    args2.forEach(arg => {
      let index = args.findIndex(item => item === '_');
      if(index < 0) return;
      args[index] = arg;
      ++placeholderNums;
    });
    if(placeholderNums < args2.length) {
      args2 = args2.slice(placeholderNums);
    }
    return fn.apply(this, [...args, ...args2]);
  }
}

function display(a, b, c, d, e) {
  console.log(a, b, c, d, e);
};

const partialDisplay = partialFunc(display, '_', 'mid', '_', 'ddd');
partialDisplay(1, 2, 3); // 1 'mid' 2 'ddd' 3
```

## 13. 斐波那契数列及其优化

```js
// 递归调用版
// 会占用大量的栈空间
function fibonaccil(n) {
  if(typeof n !== 'number' || n < 1) throw new Error('参数错误');
  if(n < 3) return 1;
  else return fibonaccil(n - 1) + fibonaccil(n - 2);
}

// 非递归版
// 占用空间少
function fibonaccil2(n) {
  if(typeof n !== 'number' || n < 1) throw new Error('参数错误');
  let p = 1;
  let q = 0;
  while(--n) {
    [p, q] = [p + q, p];
  }
  return p;
}

// 函数记忆
// 减少重复计算，但占用内存
function memory(fn) {
  let mem = {};
  return function(n) {
    if(mem[o]) return mem[o];
    mem[o] = fn(n);
    return mem[o];
  }
}

const memFibonaccil = memory(fibonaccil2);
```

## 14. 实现函数 bind 方法

```js
// bind 函数实现需要注意两点：
// 1. 可作为偏函数处理参数
// 2. 返回的函数能够成为构造函数，并且有完整且正确的原型链

Function.prototype._bind = function(context) {
  const ctx = context;
  const fn = this;
  const args = [].prototype.slice.call(arguments, 1);
  const binding = function() {
    args.push(...[].prototype.slice(arguments));
    return fn.apply(this instanceof fn ? this : ctx, args);
  };
  fn.prototype && (binding.prototype = Object.create(fn.prototype));
  return binding;
}
```

## 15. 实现函数 call 方法

```js
Function.prototype._call = function(ctx, ...args) {
  let __symbol__ = Symbol();
  ctx[__symbol__] = this;
  let res = ctx[__symbol__](...args);
  delete ctx[__symbol__];
  return res;
}
```

## 16. 简易的 CO 模块

占坑

## 17. 函数防抖

```js
function debounce(fn, wait, options) {
  let _options = Object.assign({
    leading: false,
    trailing: true,
    context: null,
  }, options);
  let timer = null;
  let _args = [];
  const _debounce =  function(...args) {
    _args = args;
    if(timer) {
      clearTimeout(timer);
      timer = null;
    }
    if(_options.leading) {
      timer = setTimeout(() => {}, wait);
      fn.apply(_options.context || this, _args);
    } else if(_options.trailing) {
      timer = setTimeout(() => {
        fn.apply(_options.context || this, _args);
        timer = null;
      }, wait);
    }
  }
  _debounce.cancel = function() {
    clearTimeout(timer);
    timer = null;
  };
  _debounce.invoke = function() {
    _debounce.cancel();
    return fn.apply(_options.context || this, _args);
  };
}
```

## 18. 函数节流

```js
function throttle(fn, wait) {
  let prev = +new Date();
  return function(...args) {
    let now = +new Date();
    if(now - prev >= wait) {
      prev = now;
      fn.apply(this, args);
    }
  }
}
```

## 19. 图片懒加载

```js
class LazyLoad {
  constructor(imgs) {
    this.images = [];
    for(let i = 0;i < imgs.length; ++i) {
      this.images[i] = {
        hasLoad: false,
        img: imgs[i]
      };
    }
    // 这里建议结合节流函数
    document.addEventListener('scroll', () => {
      for(let i = 0;i < this.images.length; ++i) {
        if(this.images[i].hasLoad) continue;
        let { top } = this.images[i].img.getBoundingClientRect();
        if(top <= window.innerHeight) {
          this.images[i].hasLoad = true;
          this.images[i].img.src = this.images[i].img.dataset.src;
          this.images[i].img = null; 
        }
      }
    });
  }
}

let imgs = document.querySelectorAll('img');
new LazyLoad(imgs);
```

## 20. new 关键字

```js
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
```

## 21. 实现 Object.assign

```js
Object.prototype._assign = function(target, ...objects) {
  return objects.reduce((pre, cur) => {
    if(cur === null) return cur;
    [...Object.keys(cur), ...Object.getOwnPropertySymbols(cur)].forEach(key => {
      pre[key] = cur[key];
    });
    return pre;
  }, target);
}
```

## 22. instanceof 实现

```js
function _instanceof(o, constructor) {
  let proto = o.__proto__;
  while(proto) {
    if(proto === constructor.prototype) return true;
    proto = proto.__proto__;
  }
  return false;
}
```

## 23. 私有变量的实现

```js
// 模块化做法
// 如果使用的是commonjs或者es module这样的模块化形式
// 配合 ES6 的 Symbol 即可

// student.js
const __name__ = Symbol('name');
const __privateFunc__ = Symbol('pf');

class Student {
  constructor(name) {
    this[__name__] = name; // 私有属性
  }
  get name() {
    return this[__name__];
  }
  setName(newName) {
    this[__name__] = newName;
  }
  [__privateFunc__]() { // 私有方法
    console.log('我是私有方法，外部无法访问');
  }
}

// 非模块化
// 可以通过 proxy 禁止方法下划线开头的变量和方法

function getStudent(name) {

  class Student {
    constructor(name) {
      this._name = name; // 私有属性
    }
  }

  return new Proxy(new Student(name), {
    get: function(target, key, receiver) {
      if(key.startsWith('_')) throw new Error('private member is not allowed to get');
      return Reflect.get(target, key, receiver);
    },
    set: function(target, key, value, receiver) {
      if(key.startsWith('_')) throw new Error('private member is not allowed to set');
      return Reflect.set(target, key, value, receiver);
    }
  });
}
```

## 24. 洗牌算法（数组乱序）

```js
function shuffle(arr) {
  for(let i = 0;i < arr.length; ++i) {
    let randomIndex = i + Math.floor(Math.random() * (arr.length - i));
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
}
```

## 25. 单例模式

```js
// 简单用法：
let instance;
function getInstance(func, ...args) {
  if(!instance) {
    instance = new func(...args);
  }
  return instance;
}

// ES6 proxy
function singleton(func) {
  let instance;
  return new Proxy(func, {
    construct(...args) {
      if(!instance) {
        instance = Reflect.construct(func, args);
      }
      return instance;
    }
  });
}
```

## 26. promisify

```js
function promisify(asyncFunction) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      args.push(function callback(err, ...values) {
        if(err) {
          reject(err);
        }
        resolve(...values);
      });
      asyncFunction.apply(this, args);
    });
  }
}
```

## 27. 优雅地处理 async/await

```js
// 其实就是加一层异常捕获
async function errorCapturedAsync(func, ...args) {
  try {
    let res = await func(...args);
    return [null, res];
  } catch(e) {
    return [e, null];
  }
}
```

## 28. 发布订阅 EventEmitter

```js
class EventEmitter {
  constructor() {
    this.callbacks = {};
  }

  on(event, callback) {
    let cbs = this.callbacks[event] || (this.callbacks[event] = []);
    cbs.push(callback);
  }

  once(event, callback) {
    let cb = function(...args) {
      let hasRun = false;
      if(hasRun) return;
      hasRun = true;
      return callback(...args);
    }
    this.on(event, cb);
  }

  emit(event, ...args) {
    let cbs = this.callbacks[event];
    if(!cbs) return;
    cbs.forEach(cb => cb(...args));
  }

  off(event, callback) {
    if(!event) return;
    let cbs = this.callbacks[event];
    if(!cbs) return;
    if(!callback) {
      delete cbs;
      return;
    }
    cbs = cbs.filter(cb => cb !== callback);
  }
}
```