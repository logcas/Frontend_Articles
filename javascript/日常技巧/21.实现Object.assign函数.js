// Object assign 是一个对象合并函数
// 但本质上也是一个对象浅拷贝函数

Object.prototype._assign = function(target, ...objects) {
  return objects.reduce((pre, cur) => {
    if(cur === null) return cur;
    [...Object.keys(cur), ...Object.getOwnPropertySymbols(cur)].forEach(key => {
      pre[key] = cur[key];
    });
    return pre;
  }, target);
}