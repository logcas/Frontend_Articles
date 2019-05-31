Function.prototype._call = function(ctx, ...args) {
  let __symbol__ = Symbol();
  ctx[__symbol__] = this;
  let res = ctx[__symbol__](...args);
  delete ctx[__symbol__];
  return res;
}