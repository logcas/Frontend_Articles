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