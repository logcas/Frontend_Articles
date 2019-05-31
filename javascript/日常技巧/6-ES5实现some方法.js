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
