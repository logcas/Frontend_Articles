// Array.prototype.map 接收一个函数作为参数
// 它会以数组中的每个项作为参数传入这个函数执行
// 并且以执行的返回值作为该项的新值
// 它不修改原来的数组，而是返回一个新数组

function _map(arr, fn = v => v) {
  if(!Array.isArray(arr)) {
    throw new Error('arr is not array');
  }
  let res = [];
  for(let i = 0;i < arr.length; ++i) {
    res[i] = fn(arr[i]);
  }
  return res;
}