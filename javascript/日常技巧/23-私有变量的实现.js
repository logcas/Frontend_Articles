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