Function.prototype.myBind = function(context, ...args) {
  let fn = this;
  let ctx = context || null;
  let allAgrs = [].concat(args);
  let fBound = function(...args) {
    allAgrs = allAgrs.concat(args);
    return fn.apply(this instanceof fn ? this : ctx, allAgrs);
  };
  fn.prototype && (fBound.prototype = Object.create(fn.prototype));
  return fBound;
}

function People(sex, name) {
  this.sex = sex;
  this.name = name;
}

let Boy = People.myBind(null, '男');
let b = new Boy('xiaoming');
console.log(b);
console.log(b instanceof Boy);
console.log(b instanceof People);

let _Boy = People.bind(null, '男');
let _b = new _Boy('wawa');
console.log(_b);
console.log(_b instanceof _Boy);
console.log(_b instanceof People);
