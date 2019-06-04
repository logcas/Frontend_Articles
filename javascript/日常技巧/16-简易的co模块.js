function co(fn) {
  let gen = fn();
  let result = gen.next();

  return new Promise((resolve, reject) => {
    function next(result) {
      if(result.done) resolve(result);
      result.value = Promise.resolve(result.value);
      result.value.then(res => {
        let result = it.next(res);
        next(result);
      }).catch(e => {
        reject(e);
      });
    }
    next(result);
  });
}