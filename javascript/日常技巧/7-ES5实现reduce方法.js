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