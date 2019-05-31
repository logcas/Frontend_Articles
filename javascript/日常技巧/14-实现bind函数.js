// bind 函数实现需要注意两点：
// 1. 可作为偏函数处理参数
// 2. 返回的函数能够成为构造函数，并且有完整且正确的原型链

Function.prototype._bind = function(context) {
  const ctx = context;
  const fn = this;
  const args = [].prototype.slice.call(arguments, 1);
  const binding = function() {
    args.push(...[].prototype.slice(arguments));
    return fn.apply(this instanceof fn ? this : ctx, args);
  };
  fn.prototype && (binding.prototype = Object.create(fn.prototype));
  return binding;
}