function flat(array) {
  return array.reduce((pre, cur) => Array.isArray(cur) ? [...pre, ...flat(cur)] : [...pre, cur], []);
}

let a = [1, 2, [3, 4, 5, [7, 8, 9, [10]]]];
let b = flat(a);
console.log(b); // [ 1, 2, 3, 4, 5, 7, 8, 9, 10 ]