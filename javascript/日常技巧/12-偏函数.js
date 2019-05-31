function partialFunc(fn, ...args) {
  let placeholderNums = 0;
  return function(...args2) {
    args2.forEach(arg => {
      let index = args.findIndex(item => item === '_');
      if(index < 0) return;
      args[index] = arg;
      ++placeholderNums;
    });
    if(placeholderNums < args2.length) {
      args2 = args2.slice(placeholderNums);
    }
    return fn.apply(this, [...args, ...args2]);
  }
}

function display(a, b, c, d, e) {
  console.log(a, b, c, d, e);
};

const partialDisplay = partialFunc(display, '_', 'mid', '_', 'ddd');
partialDisplay(1, 2, 3); // 1 'mid' 2 'ddd' 3