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