function throttle(fn, wait) {
  let prev = +new Date();
  return function(...args) {
    let now = +new Date();
    if(now - prev >= wait) {
      prev = now;
      fn.apply(this, args);
    }
  }
}