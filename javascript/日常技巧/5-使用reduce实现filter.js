Array.prototype._filter = function(fn) {
  return this.reduce((pre, cur) => fn(cur) ? [...pre, cur] : pre, []);
}

let a = [1, 2, 3, 4, 5, 6];
let b = a._filter(v => !!(v & 1)); // 过滤偶数
console.log(b); // [1, 3, 5]