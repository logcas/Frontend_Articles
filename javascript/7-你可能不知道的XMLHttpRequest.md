## 如何使用XMLHttpRequest
```js
const xhr = new XMLHttpRequest();
xhr.open('get', '/get', true);
xhr.onreadystatechange = function() {
  console.log('readystate: ', xhr.readyState);
  if (xhr.readyState === 4) {
    if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
      console.log(xhr.response);
    }
  }
};
xhr.send('1234');
```

## 事件

|事件处理器|事件名（类型）|
|--|--|
|onloadstart|	loadstart|
|onprogress|	progress|
|onabort|	abort|
|onerror|	error|
|onload|	load|
|ontimeout|	timeout|
|onloadend|	loadend|

值得一提的是，XMLHttpRequest和XMLHttpRequestUpload都继承自XMLHttpRequestEventTarget，所有都拥有上述的事件处理器。

但只有XMLHttpRequest才拥有`onreadystatechange`事件处理器。


## XHR的状态
XMLHttpRequest实例的状态如下图所示：
|状态名|状态值|描述|
|--|--|--|
|unsent|0|实例对象被创建，但`open()`方法未调用|
|opened|1|`open()`方法被成功调用，在这个状态可以通过`setRequestHeader()`设置请求头，并且可以通过调用`send()`方法发起请求。|
|headers received|2|`send()`方法被调用之后，并且接收到响应的所有HTTP头部信息|
|loading|3|正在接收请求体|
|done|4|数据全部传输完成或者中途出现了错误|

对于要跟踪XHR的状态，我们可以通过`onreadystatechange`事件获取：
```js
xhr.onreadystatechange = function(x) {
  console.log(xhr.readyState);
};
```

## XHR的头部信息
默认情况下，XHR在发送请求的同时会发送以下头部信息：
* Accept
* Accept-Charset
* Accept-Encoding
* Accept-Language
* Connection
* Cookie
* Host
* Referer
* User-Agent

不同浏览器实际发送的头部信息会有所不同，但以上这些基本上是所有浏览器都会发送的。

### 添加请求Header

对于其他自定义的头部信息，可以通过`xhr.setRequestHeader`进行添加。

注意：
* `setRequestHeader`方法必须在`open()`方法调用之后，`send()`方法调用之前调用，否则会抛出`InvalidStateError`的错误。

```js
const xhr = new XMLHttpRequest();
xhr.open('post', '/post', true);
xhr.onreadystatechange = function(x) {
  console.log(xhr.readyState);
};
xhr.setRequestHeader('X-A', 'aaa');
xhr.setRequestHeader('X-A', 'bbb');
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Content-Type', 'application/json2');
xhr.setRequestHeader('Content-Type', 'application/json3');
xhr.send('1234');

// 最终的头部是：
// X-A: aaa, bbb
// Content-Type: application/json, application/json2, application/json3
```

**需要注意的是，通过`setRequestHeader`进行添加的头部，不会进行覆盖，而是会拼接在一起。**

### 获取响应Header

获取响应头部信息可以通过`getAllResponseHeaders()`方法，它返回一个字符串，并且每一条头部信息都是通过`\r\n`分隔。

```js
const xhr = new XMLHttpRequest();
xhr.open('post', '/post', true);
xhr.onreadystatechange = function(x) {
  if (xhr.readyState === xhr.HEADERS_RECEIVED) {
    console.log(xhr.getAllResponseHeaders());
  }
};
xhr.send(null);

// connection: keep-alive
// content-length: 11
// content-type: text/html; charset=utf-8
// date: Thu, 14 May 2020 13:19:08 GMT
// etag: W/"b-SeRn+P0S5Cv7Z2+z+paQB3qapuc"
// x-powered-by: Express
```

还可以通过`getResponseHeader()`方法获取指定的头部值，并且传入的值是**不区分大小写**的，你可以写`Content-Type`、`content-type`甚至是`ConTent-TYPE`。

```js
const xhr = new XMLHttpRequest();
xhr.open('post', '/post', true);
xhr.onreadystatechange = function(x) {
  if (xhr.readyState === xhr.HEADERS_RECEIVED) {
    console.log(xhr.getResponseHeader('Content-Type'));
    console.log(xhr.getResponseHeader('content-type'));
    console.log(xhr.getResponseHeader('Content-type'));
  }
};
xhr.send(null);

// text/html; charset=utf-8
// text/html; charset=utf-8
// text/html; charset=utf-8
```

但是需要注意的是，`getResponseHeader()`以及`getAllResponseHeaders()`都并不是允许获取所有头部信息。

W3C对`XMLHttpRequest Level1`进行了如下限制：
* 客户端无法获取`Set-Cookie`以及`Set-Cookie2`这两个字段

由于`XMLHttpRequest Level1`并不支持跨域请求，因此，`XMLHttpRequest Level2`对于跨域请求也做了限制：对于跨域请求，客户端只能获取response headers中属于`simple response header`或`Access-Control-Expose-Headers`中的头部字段。

其中[`simple response header`](https://www.w3.org/TR/cors/#simple-response-header)指的是：
* Cache-Control
* Content-Language
* Content-Type
* Expires
* Last-Modified
* Pragma

```js
const xhr = new XMLHttpRequest();
xhr.open('get', '/get', true);
xhr.onreadystatechange = function(x) {
  if (xhr.readyState === xhr.HEADERS_RECEIVED) {
    console.log(xhr.getResponseHeader('Set-Cookie'));
  }
};
xhr.send(null);

// 报错：Refused to get unsafe header "Set-Cookie"
```

因此，`getAllResponseHeaders()`只能获取结合上述限制之内的头部信息的集合，而`getResponseHeader(headerName)`中的`HeaderName`必须是以上限制以内的字段，否则就会报错：`Refused to get unsafe header "HeaderName"`。

## 设置超时时限
```js
xhr.timeout = 10000;
// 10 秒后未请求完成的话就超时
```

`timeout`属性以毫秒为单位，可以设置一个非0的值作为”经过多少毫秒后结束请求“的限制。

`timeout`其实很好理解，当执行`xhr.send()`方法时开始计时，直到`loadend`事件触发时计时结束。如果时间超出后并未触发`loadend`事件，那么就会触发`timeout`事件。

**需要注意的是，即使我们在请求的途中设置`timeout`，例如在`onprogress`事件处理程序中设置，它的基准都是基于`loadstart`事件触发时的时间基准计算的。**

|时间|过程1|过程2|
|--|--|--|
|0s|send()|send()|
|5s|timeout=6000|timeout=12000|
|6s|超时，触发`ontimeout`||
|10s||响应成功|
|12s||这里才超时，但已经响应成功了，不会触发`ontimeout`|


*此外，`timeout`只适用于异步请求，如果当前XHR是同步的（并且全局对象为Window），那么就会抛出`InvalidAccessError`的错误。*

## 发送请求体
通过XHR发送请求时，我们都知道，发送请求体是通过`send()`方法：

```js
xhr.send(data);
```

首先，`send()`方法调用前XHR实例的状态必须是`opened`，也就是说，必须先调用`open()`方法才可以最终调用`send()`方法发出请求。当状态不是`opened`或者重复调用`send()`方法，都会抛出`InvalidStateError`异常。

其次，对于`GET`和`HEAD`请求，不管你传不传入`data`，最终都会被忽略掉。也就是说，通过XMLHttpRequest发送请求时，`GET`和`HEAD`请求不会携带请求体，如果需要传参，需要通过URL拼接。

对于非`GET`和`HEAD`请求，`send(data)`方法接收一个参数作为请求体传入。并且XHR会根据传入的数据的类型来更改请求头的`Content-Type`字段：
* 如果是`HTML Document`类型，那么会设置为`text/html;charset=UTF-8`。
* 如果是`XML document`类型，那么会设置为`application/xml;charset=UTF-8`。
* 如果是`FormData`类型，那么会设置为`multipart/form-data; boundary=xxxxxxx`。
* 如果是`DOMString`类型，那么会设置为`text/plain;charset=UTF-8`。
* 如果是`URLSearchParams`，那么会设置为`application/x-www-form-urlencoded;charset=UTF-8`。
* 如果是其他类型，那么不会添加`Content-Type`字段。

另外，我们也可以通过`xhr.setRequestHeader()`设置`Content-Type`，并且它会覆盖上述由XHR自动判断而添加的头部。

## 设置响应数据的类型
设置响应数据返回的类型可以有两种方法，分别是`level1`的`overrideMimeType()`方法以及`level2`的`xhr.responseType`属性。

根据W3C的描述，`overrideMimeType(mime)`设置的mime跟HTTP头部`Content-Type`的mime是相似的。通过该方法可以修改`xhr.response`返回的数据类型。

而`xhr.responseType`则是`level2`新增的一个属性，默认为空，可选值有`arraybuffer`、`blob`、`document`、`json`、`text`。*需要注意的是，如果在XHR的状态是`loading`或`done`时再更改`responseType`的值，会抛出`InvalidStateError`异常。*

鉴于`responseType`的兼容性得到改善，`overrideMimeType()`似乎已经很少再使用了。


## 获取响应数据

一般我们通过XHR获取响应数据都是通过`xhr.response`、`xhr.responseText`获取。

#### `response`
对于`xhr.responseType`为空或者值为`text`时：
* 如果XHR状态不是loading或者done，都返回空字符串
* 否则返回已经接收的数据文本（loading时是部分数据，done时是全部数据）

对于`xhr.responseType`为`arraybuffter`、`blob`、`document`、`json`时：
* 如果状态为完成或请求失败，返回`null`。
* 如果是`arraybuffter`，返回`ArrayBuffer`对象（如果转换失败则返回`null`）。
* 如果是`blob`，返回`Blob`对象。
* 如果是`document`，返回`Document`对象。
* 如果是`json`，返回`json`对象（如果解析失败则返回`null`）。

#### `responseText`
`xhr.responseText`只有在`xhr.responseType`的值为空或者`text`时有效，其余情况会调用时会抛出`InvalidStateError`异常。

## 监控上传过程
通过`xhr.upload`可以访问`XMLHttpRequestUpload`对象，并且，每一个XMLHttpRequest对象都有一个相关联的XMLHttpRequestUpload对象。

`XMLHttpRequestUpload`和`XMLHttpRequest`都继承自`XMLHttpRequestEventTarget`，根据`XMLHttpRequestEventTarget`的接口描述可以知道，他们两个都有以下的事件处理程序：
```js
interface XMLHttpRequestEventTarget : EventTarget {
  // event handlers
  attribute EventHandler onloadstart;
  attribute EventHandler onprogress;
  attribute EventHandler onabort;
  attribute EventHandler onerror;
  attribute EventHandler onload;
  attribute EventHandler ontimeout;
  attribute EventHandler onloadend;
};

[Exposed=(Window,DedicatedWorker,SharedWorker)]
interface XMLHttpRequestUpload : XMLHttpRequestEventTarget {
};
```

也就是说，通过`xhr.upload.onprogress`可以监控整个上传的进度过程，这常用于日常业务当中。

```js
xhr.upload.onprogress = (e) => {
  console.log(`upload: ${e.loaded / e.total * 100}%`)
};
```

### 上传与下载的事件触发顺序
```js
const xhr = new XMLHttpRequest();
xhr.open('post', '/post', true);
xhr.upload.onloadstart = () => { console.log('upload loadstart') };
xhr.upload.onloadend = () => { console.log('upload loadend') };
xhr.upload.onload = () => { console.log('upload load') };
xhr.upload.onprogress = (e) => {
  console.log(`upload: ${e.loaded / e.total * 100}%`)
};
xhr.onloadstart = () => { console.log('xhr loadstart') };
xhr.onloadend = () => { console.log('xhr loadend') };
xhr.onload = () => { console.log('xhr load') };
xhr.onprogress = (e) => {
  console.log(`xhr: ${e.loaded / e.total * 100}%`)
};
xhr.send(new URLSearchParams('a=1&b=2'));

// xhr loadstart
// upload loadstart
// upload: 100%
// upload load
// upload loadend
// xhr: 100%
// xhr load
// xhr loadend
```

可以看到，XHR的`progress`事件是代表下载过程的进度，而上传过程则交给`xhr.upload`对象中的`progress`事件。

## 同步请求
如果你认为同步请求和异步请求的区别只在于阻塞和非阻塞，那么就错了。

当使用XHR发送同步请求时会有如下的限制：
* `xhr.timeout`必须为0（或者不设置，默认为0）
* `xhr.withCredentials`必须为false
* `xhr.responseType`必须为空字符串

如果上述任意条件不满足，都会抛出`InvalidAccessError`异常。

```js
const xhr = new XMLHttpRequest();
xhr.onreadystatechange = () => {
  console.log(xhr.readyState);
};
xhr.open('post', '/post', false);
xhr.upload.onloadstart = () => { console.log('upload loadstart') };
xhr.upload.onloadend = () => { console.log('upload loadend') };
xhr.upload.onload = () => { console.log('upload load') };
xhr.upload.onprogress = (e) => {
  console.log(`upload: ${e.loaded / e.total * 100}%`)
};
xhr.onloadstart = () => { console.log('xhr loadstart') };
xhr.onloadend = () => { console.log('xhr loadend') };
xhr.onload = () => { console.log('xhr load') };
xhr.onprogress = (e) => {
  console.log(`xhr: ${e.loaded / e.total * 100}%`)
};
xhr.send(new URLSearchParams('a=1&b=2'));
// 1
// 4
// xhr load
// xhr loadend
```

此外，从上述代码的输出可以看到，同步请求的`readystatechange`只会触发1和4状态，也就是`opened`和`done`时触发，而`header_received`和`loading`时并不会触发。也就是说，同步请求并不能触发过程的回调，因为`xhr.upload`的事件都没有触发，而`xhr`的事件仅触发了`oload`、`loadend`、`readystatechange`（仅两次）。

同步请求的限制简单来说就是：不能设置超时、跨域时不能携带Cookie、不能设置返回类型、无法监控上传和下载的过程、阻塞主线程。

## withCredentials

在进行CORS跨域的时候，大家都知道如果想要在跨域上携带Cookie，那么就需要把XHR实例的`withCredentials`设置为`true`。

```js
xhr.withCredentials = true;
```

如果不设置，`withCredentials`默认为`false`。当`withCredentials=false`时，在跨域请求下，请求头不会携带Cookie并且浏览器会忽略响应头部的`Set-Cookie`字段，也就是即使是响应中拥有`Set-Cookie`字段，该cookie不会保留到浏览器，而是会被忽略。

此外，当`withCredentials=true`时，响应头部必须有一个`Access-Control-Allow-Credentials: true`的字段，并且值为`true`。当值为`false`，那么该跨域请求就会被浏览器拦截下来。

![image](http://static-cdn.lxzmww.xyz/Credentials%E4%B8%BAfalse.PNG)

最后需要注意的一点时，当`withCredentials=true`时发起的跨域请求，服务到期端不能将`Access-Control-Allow-Origin`设置为`*`，必须为请求页面的具体域名，否则该跨域请求同样会被拦截。

![image](http://static-cdn.lxzmww.xyz/allowOrigin%E4%B8%BA%E6%98%9F.png)

**PS: `withCredentials`属性对同域请求无任何影响**

## 调用 send() 之后发生了什么(异步状态)
### 准备阶段
1. 如果XHR的状态不是`opened`（也就是还没调用`open()`方法），或者重复调用`send()`方法，就抛出`InvalidStateError`的异常。
2. 如果请求方法为`GET`或者`HEAD`，把请求`body`设置为`null`，即使你传入的数据，也会被忽略。
3. 如果`body`不为空，那么XHR实例会根据`body`的类型自动填充请求头`Content-Type`的值，一般遵循这些规则：
  * `Blob`：通过该`Blob`对象的`type`属性获取MIME类型
  * `FormData`: `multipart/form-data; boundary=`
  * `URLSearchParams`: `application/x-www-form-urlencoded;charset=UTF-8`
  * `USVString`: `text/plain;charset=UTF-8`
  * `HTML Document`: `Content-Type`/`text/html;charset=UTF-8`
  * `XML Document`: `application/xml;charset=UTF-8`
4. 如果`body`为空，设置`upload complete flag`（即`xhr.upload`中的事件不会触发）
5. 触发`loadstart`时间，并且参数`event.loaed = 0`且`event.total = 0`
6. 如果`upload complete flag`未设置并且`xhr.upload`注册了事件侦听器，那么就触发`upload.loadstart`事件，同样参数`event.loaed = 0`且`event.total = 0`。

### 请求阶段
在整个过程中会不断地并行执行这两个任务：
1. 只要请求未完成，就不断地计算`timeout`的剩余时间。（如果`timeout=0`就不执行）
2. 当超出了`timeout`时间，就把请求标识为完成状态，并且标识为超时以及终止请求。

#### 处理请求`body`

##### 请求`body`的上传过程
**只当有新的数据被传输，才会触发以下的处理步骤：**
1. 自带50ms的节流，如果上次触发至今还没有50ms，那就不走第二步了
2. 如果`xhr.upload.onprogress`有事件处理器，那么就触发，参数`event.loaded=已传输的字节数`，`event.total=总字节数`。

##### 请求`body`的上传结束
1. 设置`upload complete flag`
2. 如果`xhr.upload`没有设置事件处理器，那么下面的步骤就不进行了。
3. 设`transimitted = 已传输的字节数`
4. 设`length = body总字节数`
5. 分别按顺序触发`xhr.upload`的`progress`、`load`、`loadend`事件处理回调，参数`event.loaded = transimitted`、`event.total = length`。

### 响应阶段

##### 响应头部信息的接收
1. 如果有异常则进入异常处理，返回。
2. 当头部信息接收完毕后，XHR实例状态进入到`headers received`。
3. 触发`readystatechange`事件

##### 响应`body`的接收过程
1. 如果有异常则进入异常处理，返回。
2. 第一次执行时XHR实例状态从`headers received`转为`loading`
3. 通过流接收数据，并且自带50ms节流。
4. 触发`readystatechange`事件
5. 触发`progress`事件
6. 当接收完毕后进入“响应`body`的结束过程”，否则重复触发上面的步骤
7. 当有异常时进入“异常处理过程”

##### 响应`body`的结束过程
1. 异常处理（网络异常、响应异常）
2. 触发`progress`事件
3. XHR实例的状态从`loading`转为`done`
3. 触发`readystatechange`事件
4. 触发`load`事件
5. 触发`loaded`事件

#### 异常处理
1. 对于`timeout`的超时错误，触发`TimeoutError`的异常
2. 对于网络错误，触发`NetworkError`的异常
3. 对于主动调用`abort()`方法取消请求，触发`AbortError`异常

以上三种异常情况都会触发以下的异常处理步骤：
1. 把XHR的实例状态设置为`done`
2. 把`response`设置为一个`NetworkError`实例
3. 触发`readystatechange`事件
4. 如果上传过程还没完成：
  1. 标识上传完成
  2. 触发`xhr.upload.progress`事件，参数中`event.loaded = event.total = 0`
  3. 触发`loadend`事件，参数同上
5. 触发`progress`事件，参数同上
6. 触发`loadend`事件，参数同上

### 小结
1. 从整个流程可以看到各类事件的触发顺序，另外`readystatechange`事件触发的次数比XHR实例状态转变的次数要多，这里的原因从W3C描述是兼容性的问题。(`Web compatibility is the reason readystatechange fires more often than state changes.`)
2. 对于`progress`类事件，都有自带至少50ms的节流，同时，只有在有新数据字节上传或下载后才会触发。(`These steps are only invoked when new bytes are transmitted.`)
