// 其实就是加一层异常捕获
async function errorCapturedAsync(func, ...args) {
  try {
    let res = await func(...args);
    return [null, res];
  } catch(e) {
    return [e, null];
  }
}
