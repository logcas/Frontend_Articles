class EventEmitter {
  
  constructor() {
    this.callbacks = {};
  }

  on(event, callback) {
    let cbs = this.callbacks[event] || (this.callbacks[event] = []);
    cbs.push(callback);
  }

  once(event, callback) {
    let cb = function(...args) {
      let hasRun = false;
      if(hasRun) return;
      hasRun = true;
      return callback(...args);
    }
    this.on(event, cb);
  }

  emit(event, ...args) {
    let cbs = this.callbacks[event];
    if(!cbs) return;
    cbs.forEach(cb => cb(...args));
  }

  off(event, callback) {
    if(!event) return;
    let cbs = this.callbacks[event];
    if(!cbs) return;
    if(!callback) {
      delete cbs;
      return;
    }
    cbs = cbs.filter(cb => cb !== callback);
  }

}