function currying(fn, ...args) {
  let len = fn.length;
  const generator = function(...genArgs) {
    args = [...args, ...genArgs];
    if(args.length >= len) {
      return fn.apply(this, args);
    } else {
      return generator;
    }
  }
  return generator;
}

function add(a, b, c, d) {
  return a + b + c + d;
}

let curryingAdd = currying(add, 1);
let r = curryingAdd(2)(3)(4);
console.log(r); // 10