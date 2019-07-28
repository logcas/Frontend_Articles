# EventLoop 事件循环机制
Node中的事件循环机制跟浏览器的事件循环机制几乎完全不同，并且由于Node是处理服务端任务的，因此，Node中的事件循环机制更加复杂。

引用官网的图就是这样：aaa
```
   ┌───────────────────────────┐
┌─>│           timers          │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │
   └───────────────────────────┘
```

每一次事件循环一共分为六个阶段：`timers`、`pending callback`、`idle`、`poll`、`check`、`close callbacks`。

现在我们来主要介绍一下每个阶段Node的作用。

## `timers`
`timers`是每次Loop的第一个阶段，它维护了一个队列，这个队列存放着由`setTimeout()`和`setInterval()`安排的并且按执行时间升序排列的回调函数。当进入`timers`阶段时，Node都会从队列中依次执行已经到时的回调。这个阶段维护一个叫`timers_queue`的队列，存放可执行的回调。

简而言之，就是`setTimeout()`和`setInterval()`的回调会在这个阶段执行（如果时间已到）。但是，`setTimeout()`和`setInterval()`的回调函数**并不是**在某个时间后准时执行，而是在某个时间后加入到队列中。至于什么时候执行，就要看什么时候到达`timers`阶段了。因此，`setTimeout()`和`setInterval()`的回调一般都会有延迟，并不准时。

## `pending callback`
执行上一次Loop中还没被执行的IO回调函数。

## `idle`
Node内部使用，一般不需要关注。

## `poll`
`poll`是Node的EventLoop中最重要的阶段之一，一些网络请求、文件IO等的回调都是在这个阶段处理。这个阶段维护了一个`poll_queue`的列队，里面存放需要处理的回调函数。

根据文档所述，它主要做两件事：
1. 计算需要为网络请求、IO等阻塞多久
2. 然后同步地、依次地执行它们的回调函数（也就是清空`poll_queue`）

当进入这个阶段后，如果`timers_queue`中为空，也就是说没有需要处理的`setTimeout()`和`setInterval()`回调时，会执行下面的两个之一：
1. 如果`poll_queue`不为空，那么就肯定时同步地、依次地执行`poll_queue`中的回调，直到`poll_queue`为空或者到达设置的回调执行最大数目。
2. 如果`poll_queue`为空，那么就会执行以下操作：
    1. 如果有`setImmediate()`回调需要处理，则结束`poll`阶段，进入下一个`check`阶段。
    2. 如果没有，那么就阻塞等待一小段时间，等待`poll_queue`中添加回调函数，然后立刻清空`poll_queue`队列。
  
如果`timers_queue`不为空，也就是说有需要处理的`setTimeout()`和`setInterval()`回调时，就会回到`timers`阶段处理。

## `check`
`check`阶段维护了一个队列，里面存放可执行的`setImmediate()`的回调函数，进入这个阶段后，就会把这个队列中的回调依次执行，清空队列。

## `close callback`
如果一个socket被突然关闭（例如调用了socket.destroy()），那么，对应的`close`事件的回调会在这个阶段执行。否则，会通过`process.nextTick()`进行包裹去触发。

## Loop 结束时
在这次Loop结束后，下次Loop开始前，Node.js都会检测是否还有异步IO或者timers（`setTimeout()`和`setInterval()`），如果没有，就会结束程序，否则就进入下一个Loop。

## `Promise.then()` 和 `process.nextTick()`
`Promise.then()` 和 `process.nextTick()`都是属于微任务，在Node.js的EventLoop中，我们没有看到它们的身影。也就是说，实际上它们是不属于EventLoop的一部分，而它们又是怎么样执行的呢？

实际上它们会穿插与每一个阶段之间：
```
LoopStart -> MicroTask -> timers -> MicroTask -> pending callback -> MicroTask -> idle -> MicroTask -> poll -> MicroTask -> check -> MicroTask -> close callback -> LoopEnd
```

因此，微任务在Node.js中是在事件循环的阶段更换之间执行的，每次执行就会清空微任务队列。

