## this
很多人觉得`this`很迷，但实际上不是，只是没有了解到`this`指向的真正核心之处。

其实一般来讲，`this`指向只有三种情况：
1. 对于普通函数而言，`this`指向在运行时确定。
2. 对于对象的方法而言，`this`指向对象的实例。
3. 对于箭头函数而言，`this`在定义时确定。（实际上箭头函数不存在`this`）

### 普通函数中的 `this`
```js
function foo() {
  console.log(this);
}
foo(); // window
```
对于普通函数而言，如果不强制绑定的话，正常模式下，`this`指向全局对象，浏览器环境下是`window`，而Node环境下就是`global`。

对于严格模式，`this`指向`undefined`。
```js
'use strict'
function foo() {
  console.log(this);
}
foo(); // undefined
```

### 对象方法中的 `this`
```js
let obj = {
  a: 666,
  foo() {
    console.log(this.a);
  }
}
obj.foo(); // 666
let f = obj.foo;
f(); // undefined
```

对于对象中的方法，实际上很容易确定`this`：`谁调用就指向谁`。上面的代码中，我们执行`obj.foo()`语句，也就是说，`obj`对象调用`foo`函数，因此，`this`指向对象`obj`，然后输出了`obj.a`的值。

如果我们把`obj.foo`赋值给一个变量，那么，由于函数是引用类型，因此，上述代码中，变量`f`实际上就是和`obj.foo`指向同一个函数。由于我们直接调用`f()`，而不是通过对象`obj`，因此，函数`f`中的`this`指向了全局对象，因此输出`window.a`。

### 箭头函数中的 `this`
对于箭头函数而言，有一种说法是箭头函数的`this`是在定义时确定的。实际上，这种方法并不准确，我们看看下面的代码：
```js
var obj = { 
    foo: () => {
       console.log(this);
    },
};
obj.foo(); // Window {postMessage: ƒ, blur: ƒ, focus: ƒ, close: ƒ, parent: Window, …}
```

如果`this`是在定义时确定的，那么我们调用`obj.foo()`时，输出的应该是`obj`对象，而不是`window`对象。这样的话，我们可以知道，这种说法并不准确。

那箭头函数的`this`究竟是如何确定的呢？

**实际上箭头函数是没有`this`的。**

箭头函数中的`this`，实际上只是它上层函数作用域中的`this`罢了。

```js
let a = 888;
let obj = {
  a: 666,
  foo() {
    console.log(this);
    return () => {
      console.log(this.a);
    }
  },
};
let obj2 = {
  a: 777,
};
obj.foo()(); // 666
obj2.foo = obj.foo;
obj2.foo()(); // 777
let f = obj.foo;
f()(); // undefined
```

当`foo`函数中的`this`不断更换时，箭头函数的`this`也在跟随着变化，并且跟外部指向相同的`this`。因此可以说明，箭头函数实际上是不存在自己的`this`，如果在箭头函数中有`this`，那么，这个`this`实际上就是它上层作用域的`this`。

### `this` 总结
对于`this`的指向，实际上是这样的：
1. 谁调用就指向谁
2. 如果没有对象调用，普通执行，就指向全局
3. 箭头函数没有`this`，它的`this`是上层作用域的

## 手动绑定 `this`
在JavaScript中，支持显示绑定`this`的指向。

对于显示绑定`this`，提供了`call`、`apply`、`bind`三个API作为支持。

### `call` 和 `apply`
之所以把`call`和`apply`放到一起讲，是因为它们作用基本一样，只是在调用是传参有点区别。

```js
function foo(x, y) {
  console.log(this.a, this.b, x, y);
}
let obj = {
  a: 1,
  b: 2,
};
foo.call(obj, 666, 777); // 1 2 666 777
foo.apply(obj, [666, 777]); // 1 2 666 777
```

可以看到，它们的第一个参数是`this`的指向，可以为`null`。

然后它们的唯一区别就是，`call`的参数是通过参数列表的形式传入的，而`apply`是通过数组的形式来给函数传参的。

实际上我们也可以自己实现这两个API，实现起来的非常简单：
```js
// call
function.prototype.myCall = function(context, ...args) {
  let _ctx = context || null;
  let _args = args || [];
  let _fn = Symbol();
  _ctx[_fn] = this;
  let result = _ctx[_fn](..._args);
  _ctx[_fn] = null;
  return result;
}

// apply
function.prototype.myApply = function(context, args) {
  let _ctx = context || null;
  let _args = args || [];
  let _fn = Symbol();
  _ctx[_fn] = this;
  let result = _ctx[_fn](..._args);
  _ctx[_fn] = null;
  return result;
}
```

### `bind`
通过使用`bind`，我们可以绑定`this`到某个函数上，并返回一个函数。跟`call`和`apply`不同，执行`bind`返回的是绑定了`this`的函数，而不会执行结果。

```js
function foo(x, y) {
  console.log(this.a, this.b, x, y);
}
let obj = {
  a: 1,
  b: 2,
};
let fn = obj.foo;
fn.bind(obj)(666, 777); // 1 2 666 777
fn.bind(obj, 666, 777)(); // 1 2 666 777
fn(666, 777); // undefined undefined 666 777
```

另外，我们通过`bind`返回的函数，还可以作为一个构造函数。
```js
function People(sex, name) {
  this.sex = sex;
  this.name = name;
}
let Boy = People.bind(null, '男');
let Girl = People.bind(null, '女');
let b = new Boy('Hello');
let g = new Gril('world');
console.log(b instanceof Boy && b instanceof People); // true
console.log(g instanceof Girl && g instanceof People); // true
```

实际上这就是使用了偏函数的知识，也称为柯里化。对于柯里化，我的理解就是，我们可以定义一个函数，对它不断地进行调用，可以分批地传入一些参数；与此同时，柯里化也可以提高代码的复用率。

比如我们定义两个数的加法：

```js
function add(a, b) {
  return a + b;
}
```

如果是三个数呢？

```js
function add(a, b, c) {
  return a + b + c;
}
```

如果是N个数，如果按照这样写，那么我们又要把代码重新写一遍了。这时候柯里化的好处就出现了，我们可以编写一个通用的函数A，然后通过传入一个参数去指定是多少个数的加法，然后返回这个函数B。我们可以分批给函数传入参数，直到参数的数量可以满足函数的执行。

```js
function curryAdd(n) {
  n = n || 2;
  return function (...args) {
    let _args = args || [];
    let add = function(...args) {
      _args.push(...args);
      if (_args.length >= n) {
        _args = _args.slice(0, n);
        return _args.reduce((prev, cur) => prev + cur, 0);
      } else {
        return add;
      }
    };
    if(_args.length >= n) {
      _args = _args.slice(0, n);
      return _args.reduce((prev, cur) => prev + cur, 0);
    }
    return add;
  };
}

let add2 = curryAdd(2);
console.log(add2(2, 3)); // 5
let r = add2(2)(3);
console.log(r); // 5

let add5 = curryAdd(5);
// 因为我们规定了5个数值相加，因此，计算传入更多的参数，也是无效的。
console.log(add5(1)(1)(2)(2, 2, 2)); // 8
console.log(add5(1, 2, 3, 4, 5, 6)); // 15
```

对于函数的柯里化，我们一般可以构造一个生成器函数，把对应的函数作为函数传入，然后就可以控制这个函数的参数传入，当参数到达指定数量后便会执行。

```js
function currying(fn, ...args) {
  let _agrs = [].concat(args);
  let len = fn.length;
  return function curry(...args) {
    _agrs.push(...args);
    if(_agrs.length >= len) {
      return fn.apply(this, _agrs);
    }
    return curry;
  }
}

function add(a, b, c, d) {
  return a + b + c + d;
}

let curryAdd = currying(add);
console.log(curryAdd(1,2)(3,4)); // 10
```