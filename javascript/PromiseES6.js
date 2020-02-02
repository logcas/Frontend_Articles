const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

class MyPromise {
  constructor(executor) {
    this.value = null;
    this.reason = null;
    this.status = PENDING;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];
    const resolve = value => {
      if (value instanceof MyPromise) {
        return value.then(resolve, reject);
      }
      setTimeout(() => {
        if (this.status === PENDING) {
          this.status = FULFILLED;
          this.value = value;
          this.onFulfilledCallbacks.map(cb => cb(this.value));
        }
      })
    };
    const reject = reason => {
      setTimeout(() => {
        if (this.status === PENDING) {
          this.status = REJECTED;
          this.reason = reason;
          this.onRejectedCallbacks.map(cb => cb(this.reason));
        }
      })
    };
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    let promise2;
    // onFulfilled 和 onRejected 函数是可选参数
    // 为了实现参数透传，这里需要设立默认的函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : error => {
      throw error;
    };
    if (this.status === FULFILLED) {
      return (promise2 = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        })
      }));
    } else if (this.status === REJECTED) {
      return (promise2 = new MyPromise((resolve, reject) => {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }));
    } else {
      return (promise2 = new MyPromise((resolve, reject) => {
        this.onFulfilledCallbacks.push(value => {
          try {
            let x = onFulfilled(value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
        this.onRejectedCallbacks.push(reason => {
          try {
            let x = onRejected(reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      }));
    }
  }

  catch (onRejected) {
    return this.then(null, onRejected);
  }
}

function resolvePromise(promise, x, resolve, reject) {
  // 如果 promise 和 x 指向同一对象，以 TypeError 为据因拒绝执行 promise。
  if (promise === x) {
    reject(TypeError('禁止循环引用'));
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
  } else if (x && (typeof x === 'object' || typeof x === 'function')) {
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

MyPromise.deferred = function () {
  let defer = {};
  defer.promise = new MyPromise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
};

module.exports = MyPromise;