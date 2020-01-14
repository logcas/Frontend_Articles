function serializeParams(params) {
  let serialized = '';
  Reflect.ownKeys(params).forEach((key, idx) => {
    const value = params[key];
    if (idx === 0) {
      serialized += '?';
    } else {
      serialized += '&';
    }
    serialized += encodeURIComponent(key) + '=' + encodeURIComponent(value);
  });
  return serialized;
}

function ajax(url, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (!url) {
      throw new Error('url could not be empty');
    }
    options = Object.assign({}, defaultOptions, options);
    options.method = options.method.toLowerCase();
    const xhr = new XMLHttpRequest();
    if (options.params && typeof options.params === 'object') {
      options.params = serializeParams(options.params);
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
          resolve(xhr.response);
        } else {
          reject(xhr.response);
        }
      }
    }
    xhr.open(options.method, url + serialized, true);
    if (options.headers && typeof options.headers === 'object') {
      Reflect.ownKeys(options.headers).forEach(key => {
        xhr.setRequestHeader(key, options.headers[key]);
      });
    }
    xhr.send(options.data ? JSON.stringify(options.data) : null);
  });
}