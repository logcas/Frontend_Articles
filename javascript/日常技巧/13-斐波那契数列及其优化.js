
// 递归调用版
// 会占用大量的栈空间
function fibonaccil(n) {
  if(typeof n !== 'number' || n < 1) throw new Error('参数错误');
  if(n < 3) return 1;
  else return fibonaccil(n - 1) + fibonaccil(n - 2);
}

// 非递归版
// 占用空间少
function fibonaccil2(n) {
  if(typeof n !== 'number' || n < 1) throw new Error('参数错误');
  let p = 1;
  let q = 0;
  while(--n) {
    [p, q] = [p + q, p];
  }
  return p;
}

// 函数记忆
// 减少重复计算，但占用内存
function memory(fn) {
  let mem = {};
  return function(n) {
    if(mem[o]) return mem[o];
    mem[o] = fn(n);
    return mem[o];
  }
}

const memFibonaccil = memory(fibonaccil2);