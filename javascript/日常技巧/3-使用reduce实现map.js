
Array.prototype._map = function(fn = v => v) {
  return this.reduce((pre, cur) => [...pre, fn(cur)], []);
}

let a = [1, 2, 3, 4, 5];
let b = a._map(v => v * v);
console.log(b);