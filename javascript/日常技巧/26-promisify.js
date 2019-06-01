// promisify 的意思是将一般的回调函数转化为 promise 对象

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

