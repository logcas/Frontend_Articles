const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

function MyPromise(executor) {
  this.value = null;
  this.reason = null;
  this.status = PENDING;
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = [];

  const resolve = value => {
    if (value instanceof Promise) {
      return value.then(resolve, reject);
    }
    if (this.status === PENDING) {
      setTimeout(() => {
        this.status = FULFILLED;
        this.value = value;
        this.onFulfilledCallbacks.forEach(cb => cb(this.value));
      }, 0);
    }
  };

  const reject = reason => {
    if (this.status === PENDING) {
      setTimeout(() => {
        this.status = REJECTED;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(cb => cb(this.reason));
      }, 0);
    }
  };

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

MyPromise.prototype.then = function (onFulFilled, onRejected) {
  // 设置默认回调
  onFulFilled = typeof onFulFilled === 'function' ? onFulFilled : value => value;
  onRejected = typeof onRejected === 'function' ? onRejected : error => {
    throw error;
  };
  // 返回新 Promise
  let promise;
  if (this.status === PENDING) {
    return (promise = new MyPromise((resolve, reject) => {
      this.onFulfilledCallbacks(value => {
        try {
          let x = onFulFilled(value);
          resolvePromise(promise, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
      this.onRejectedCallbacks(error => {
        try {
          let x = onRejected(error);
          resolvePromise(promise, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    }));
  } else if (this.status === FULFILLED) {
    return (promise = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onFulFilled(this.value);
          resolvePromise(promise, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      }, 0);
    }));
  } else {
    return (promise = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onRejected(this.reason);
          resolvePromise(promise, x, resolve, reject);
        } catch (error) {
          reject(error);
        }
      }, 0);
    }));
  }
};

function resolvePromise(promise, x, resolve, reject) {
  // 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise。
  if (promise === x) {
    throw new TypeError('禁止循环引用');
  }
  // 如果 x 为 Promise ，则使 promise 接受 x 的状态
  if (x instanceof MyPromise) {
    // 如果 x 处于等待态， promise 需保持为等待态直至 x 被执行或拒绝
    if (x.status === PENDING) {
      x.then(
        y => {
          resolvePromise(promise, y, resolve, reject);
        },
        reason => {
          reject(reason);
        }
      );
      // 如果 x 处于执行态，用相同的值执行 promise
      // 如果 x 处于拒绝态，用相同的据因拒绝 promise
    } else {
      x.then(resolve, reject);
    }
    // x 为对象或函数 (即 x 为 thenable)
  } else if (x && typeof x === 'object' || typeof x === 'function') {
    let called = false;
    try {
      // 把 x.then 赋值给 then。
      let then = x.then;
      //如果 then 是函数，将 x 作为函数的作用域 this 调用之。
      // 传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
      if (typeof then === 'function') {
        then.call(
          x,
          // 如果 resolvePromise 以值 y 为参数被调用，则运行 [[Resolve]](promise, y)
          // 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
          y => {
            if (called) {
              return;
            }
            called = true;
            resolvePromise(promise, y, resolve, reject)
          },
          // 如果 rejectPromise 以据因 r 为参数被调用，则以据因 r 拒绝 promise
          // 如果 resolvePromise 和 rejectPromise 均被调用，或者被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
          r => {
            if (called) {
              return;
            }
            called = true;
            reject(r);
          }
        );
        // 如果 then 不是函数，以 x 为参数执行 promise
      } else {
        resolve(x);
      }
    } catch (e) {
      // 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝 promise。
      // 如果 resolvePromise 或 rejectPromise 已经被调用，则忽略之
      // 否则以 e 为据因拒绝 promise
      if (called) {
        return;
      }
      called = true;
      reject(e);
    }
    // 如果 x 不为对象或者函数，以 x 为参数执行 promise
  } else {
    resolve(x);
  }
}

MyPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
}

MyPromise.all = function (promises) {
  return new MyPromise((resolve, reject) => {
    let len = promises.length;
    const values = [];
    for(let i = 0;i < len; ++i) {
      promises.then(val => {
        values[i] = val;
        if (values.length === len) {
          resolve(values);
        }
      }, reject);
    }
  });
}

MyPromise.race = function (promises) {
  return new MyPromise((resolve, reject) => {
    for(let i = 0;i < promises.length; ++i) {
      promises[i].then(resolve, reject);
    }
  });
}

MyPromise.resolve = function(value) {
  return new MyPromise(resolve => resolve(value));
}

MyPromise.reject = function(reason) {
  return new MyPromise((resolve, reject) => reject(reason));
}

MyPromise.deferred = function () {
  let defer = {};
  defer.promise = new MyPromise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
};

module.exports = MyPromise;