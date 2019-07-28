# Koa 源码分析
之前一直想认真读一遍Koa的源码，一直没找到机会。直到上星期实习的时候，趁着公司没有什么任务比较清闲，阅读了Koa的源码，不过直到现在才有时间去做个小记。为什么是小记呢？因为Koa源码真的短小精悍，可能真的不超过2K行，非常棒。

## 四大模块
Koa把主要的功能分成了四个模块：
1. `application`
2. `context`
3. `request`
4. `response`

每个模块独立一个JavaScript文件，并且`application.js`作为入口，构成了整个框架。

其实最主要还是`application`模块，以及它的中间件机制。

### application
我们跟着示例走：
```js
const Koa = require('koa');
const app = new Koa();
app.use(async (ctx, next) => {
  console.log('中间件1a');
  await next();
  console.log('中间件1b');
});
app.use(async (ctx, next) => {
  console.log('中间件2a');
  await next();
  console.log('中间件2b');
});
app.listen(1234);
```

以这个示例为主，我们通常会实例化一个Koa对象，这里取名为`app`。然后通过`app.use(fn)`这个方法添加中间件，最后以`app.listen()`方法打开服务器的端口，开始监听请求。

我们现在就要看看`Koa`究竟封装了什么操作。

```js
module.exports = class Application extends Emitter {

  constructor() {
    super();

    this.proxy = false;
    this.middleware = [];
    this.subdomainOffset = 2;
    this.env = process.env.NODE_ENV || 'development';
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
  }

  listen(...args) {
    debug('listen');
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    if (isGeneratorFunction(fn)) {
      deprecate('Support for generators will be removed in v3. ' +
                'See the documentation for examples of how to convert old middleware ' +
                'https://github.com/koajs/koa/blob/master/docs/migration.md');
      fn = convert(fn);
    }
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
  }

  callback() {
    const fn = compose(this.middleware);

    if (!this.listenerCount('error')) this.on('error', this.onerror);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }

  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

  createContext(req, res) {
    const context = Object.create(this.context);
    const request = context.request = Object.create(this.request);
    const response = context.response = Object.create(this.response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.state = {};
    return context;
  }

  onerror(err) {
    if (!(err instanceof Error)) throw new TypeError(util.format('non-error thrown: %j', err));

    if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    console.error();
    console.error(msg.replace(/^/gm, '  '));
    console.error();
  }
};

function respond(ctx) {
  // allow bypassing koa
  if (false === ctx.respond) return;

  if (!ctx.writable) return;

  const res = ctx.res;
  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if ('HEAD' == ctx.method) {
    if (!res.headersSent && isJSON(body)) {
      ctx.length = Buffer.byteLength(JSON.stringify(body));
    }
    return res.end();
  }

  // status body
  if (null == body) {
    if (ctx.req.httpVersionMajor >= 2) {
      body = String(code);
    } else {
      body = ctx.message || String(code);
    }
    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if ('string' == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }
  res.end(body);
}
```

一步一步来。

我们先是进行实例化`const app = new Koa()`，这里显然是一个构造函数调用，因此执行了`constructor`。

```js
module.exports = class Application extends Emitter {
  constructor() {
    super();

    this.proxy = false;
    this.middleware = [];
    this.subdomainOffset = 2;
    this.env = process.env.NODE_ENV || 'development';
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
  }
}
```

需要注意的是，`Application`还继承自`Emitter`，而`Emitter`是Node.js的一个内置模块，是一个事件发布订阅器，这说明我们还可以通过`app.on()`和`app.emit()`去订阅和触发一些事件以通信。

执行完构造函数，显然会多了几个对象，这里罗列主要的：
```js
app {
  middlewares: [], // 存放中间件
  context: Context, // 上下文，继承自 context.js 暴露的原型
  request: Request, // 封装请求，继承自 request.js 暴露的原型
  response: Response // 封装响应，继承自 response.js 暴露的原型
}
```

我们先抛开后面三个不看，探究`app.middlewares`和中间件机制。

回到示例的代码，我们下一段是执行`app.use(async function)`，为`app`对象添加了两个中间件。

`app.use`的源码是这样的：
```js
use(fn) {
  if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
  if (isGeneratorFunction(fn)) {
    deprecate('Support for generators will be removed in v3. ' +
              'See the documentation for examples of how to convert old middleware ' +
              'https://github.com/koajs/koa/blob/master/docs/migration.md');
    fn = convert(fn);
  }
  debug('use %s', fn._name || fn.name || '-');
  this.middleware.push(fn);
  return this;
}
```

添加中间件的步骤是这样的：
1. 先检测传入的中间件是不是函数，不是函数则报错。
2. 再检测传入的中间件函数是不是`generator`函数，如果是，则把`generator`转换成`async`函数（generator和async本质是一样的，因为async是generator的语法糖）。
3. 把中间件函数加入`this.middleware`数组中。

然后，最后一步，我们调用的是`app.listene()`，开始监听网络请求。
```js
listen(...args) {
  debug('listen');
  const server = http.createServer(this.callback());
  return server.listen(...args);
}
```

可以看到，实际上Koa是对Node.js的HTTP模块的一个上层封装。当我们调用listen时，会创建一个server，并且传入`this.callback()`返回一个回调函数，当有网络请求时，会通过这个回调函数进行处理。最后，调用`server.listen()`真正打开监听。

现在，我们把目光转向`this.callback`这个方法，中间件机制肯定与它有关。
```js
  callback() {
    const fn = compose(this.middleware);

    if (!this.listenerCount('error')) this.on('error', this.onerror);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }
```

可以看到，最终处理请求的回调函数是`handleRequest`，它接收两个参数`req`以及`res`，这正是`http.createServer(callback)`中`callback`所需要的函数格式。

但中间件的关键实现在于`const fn = compose(this.middleware);`这一行。

如果按照我们上面示例写的中间件函数，那么它的打印顺序是：
```
中间件1a
中间件2a
中间件2b
中间件2a
```

每个函数会以一个洋葱模型示意那样执行两遍，而又是怎么做到的呢？

我们来看看`compose()`函数的实现：
```js
function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

首先肯定是检查传入的是不是一个数组以及数组中的元素是不是函数，这里对于检测就不再多说。

关键在于返回了一个函数，它控制中间件的执行顺序。

首先返回的是`dispatch(0)`。
```js
function dispatch (i) {
  if (i <= index) return Promise.reject(new Error('next() called multiple times'))
  index = i
  let fn = middleware[i]
  if (i === middleware.length) fn = next
  if (!fn) return Promise.resolve()
  try {
    return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
  } catch (err) {
    return Promise.reject(err)
  }
}
```

`i`作为中间件在数组中的索引，可以看到，当传入`0`时获取的`fn`为数组中的第0个，即第一个中间件。

```js
  if (i === middleware.length) fn = next
  if (!fn) return Promise.resolve()
```

然后，这一段的意思是如果中间件已经全部执行过了，那么就直接返回`Promise.resolve()`。

否则，这样返回：

```js
return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
```

可以看到，`fn`传入了两个参数，第一个是`context`对象，第二个是`dispatch(i + 1)`。我们回忆以下，我们写中间件一般都是这样的：
```js
async (ctx, next) => {
  // ...
  await next();
  // ..
}
```
这里很容易看到，`context`就是ctx，`next`就是传入的下一个disptach函数。因此，我们在一个中间件中执行`await next()`实际上就是执行`await dispatch(i + 1)`。

结合`async`函数的执行机制，这里用代码来表示。

假如我们有两个中间件，按其顺序添加：
```js
const m1 = async (ctx, next) => {
  // ..
  await next();
  // ..
};
const m2 = async (ctx, next) => {
  // ..
  await next();
  // ..
};
```

通过`compose`函数，它在执行时实际上是这样的：
```js
const m1 = async (context, m2) => {
  // ..
  await m2();
  // ..
};
const m2 = async (context, Promise.resolve) => {
  // ..
  await Promise.resolve();
  // ..
};
```

在`async`函数中，如果遇到`await`关键字，那么会把函数的执行权交给`await`后的函数执行，直到该函数返回，`await`下方的代码才能够继续执行。这样，就很容易解释洋葱模型是如何实现的了。

解释完中间件机制，我们来回到这段代码：
```js
const handleRequest = (req, res) => {
  const ctx = this.createContext(req, res);
  return this.handleRequest(ctx, fn);
};
```

`ctx`是我们传入到中间件中的上下文对象，通过`this.createContext`创建并返回。而`this.createContext`也很简单：
```js
createContext(req, res) {
  const context = Object.create(this.context);
  const request = context.request = Object.create(this.request);
  const response = context.response = Object.create(this.response);
  context.app = request.app = response.app = this;
  context.req = request.req = response.req = req;
  context.res = request.res = response.res = res;
  request.ctx = response.ctx = context;
  request.response = response;
  response.request = request;
  context.originalUrl = request.originalUrl = req.url;
  context.state = {};
  return context;
}
```

实际上就是建立这样一个context对象：
```js
context {
  app: this,
  req: HTTP模块中的请求对象req,
  res: HTTP模块中的响应对象res，
  request: 继承自 this.request,
  response: 继承自 this.response
  // ..others
} extends this.context
```

以及一些相互的引用。（这里就不多说了，看代码就行了）

最后，执行这一句，把真正的处理交给`this.handleRquest`：
```js
return this.handleRequest(ctx, fn);
```

有没有觉得Koa很绕，一个函数套一个函数，实际上真正处理的居然是`this.handleRequest`。

来看看`this.handleRequest`：

```js
handleRequest(ctx, fnMiddleware) {
  const res = ctx.res;
  res.statusCode = 404;
  const onerror = err => ctx.onerror(err);
  const handleResponse = () => respond(ctx);
  onFinished(res, onerror);
  return fnMiddleware(ctx).then(handleResponse).catch(onerror);
}
```

首先设置默认的状态码，404，就是你什么都不干的话就会返回404。

然后比较关键在于统一的响应处理和错误处理：`handleResponse`和`onerror`。

**什么是统一的响应处理呢？**

例如，一般如果直接用`Node.js`的HTTP模块，我们都是这样结束一个响应的：
```js
res.end('Hello,world');
```

如果我们不调用`res.end()`，那么这个响应不会结束。

但是我们在Koa中，直接`ctx.body = 'Hello,world'`，不用手动调用结束，就能结束响应。主要还是`handleResponse`函数帮我们处理了这个事情，但实际上执行的是`this.respond`函数。

如何有效地捕获任何错误呢？这里使用了Promise。比如最后一句：
```js
return fnMiddleware(ctx).then(handleResponse).catch(onerror);
```

我们直到，当我们执行中间件的`dispatch`时，返回的是`Promise.resolve(fn(context, dispatch.bind(null, i + 1)));`，所以后续才可以调用`.then(handleResonse)`执行统一的响应处理，然后通过`.catch()`捕获在整个过程中所抛出的所有错误。

至于`this.respond`以及`onerror`内部如何处理，比较简单，这里就不说了。

## context\request\response

这三个模块其实我没什么想记录的。

request\response主要是封装一些`getter`和`setter`，主要还是把HTTP模块的`req`和`res`对象又包装了一层，使用上更方便，但当然，Koa还保留了`req`和`res`的引用。