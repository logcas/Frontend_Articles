function debounce(fn, wait, options) {
  let _options = Object.assign({
    leading: false,
    trailing: true,
    context: null,
  }, options);
  let timer = null;
  let _args = [];
  const _debounce =  function(...args) {
    _args = args;
    if(timer) {
      clearTimeout(timer);
      timer = null;
    }
    if(_options.leading) {
      timer = setTimeout(() => {}, wait);
      fn.apply(_options.context || this, _args);
    } else if(_options.trailing) {
      timer = setTimeout(() => {
        fn.apply(_options.context || this, _args);
        timer = null;
      }, wait);
    }
  }
  _debounce.cancel = function() {
    clearTimeout(timer);
    timer = null;
  };
  _debounce.invoke = function() {
    _debounce.cancel();
    return fn.apply(_options.context || this, _args);
  };
}