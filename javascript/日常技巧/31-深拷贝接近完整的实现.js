function deepClone(target) {
  // types mapping
  const TYPES = {
    Boolean: getType(true),
    Number: getType(1),
    String: getType('1'),
    Null: getType(null),
    Undefined: getType(undefined),
    Symbol: getType(Symbol(1)),
    Map: getType(new Map()),
    Set: getType(new Set()),
    Date: getType(new Date()),
    Error: getType(new Error()),
    Regex: getType(new RegExp()),
    Function: getType(new Function()),
    Object: getType(new Object()),
    Array: getType(new Array()),
  };

  // can traverse array
  const canTraverse = [
    TYPES.Map,
    TYPES.Set,
    TYPES.Object,
    TYPES.Array,
  ];

  // helpers
  const getType = o => Object.prototype.toString.call(o);
  const isObject = o => typeof o === 'object' && o !== null;
  const isArray = o => Array.isArray(o);
  const canTraverse = type => canTraverse.includes(type);
  const map = new Map();

  const handlerUntraverse = target => {
    const type = getType(target);
    switch(type) {
      case TYPES.Boolean:
        return new Object(Boolean.prototype.valueOf.call(target));
      case TYPES.Number:
        return new Object(Number.prototype.valueOf.call(target));
      case TYPES.String:
        return new String(String.prototype.valueOf.call(target));
      case TYPES.Regex:
        return new RegExp(target.source, target.flags);
      case TYPES.Function:
        return handlerFunction(target);
      default:
        const Ctor = target.constructor || Object;
        return new Ctor(target);
    }
  }

  const handlerFunction = func => {
    return func;
  }

  return _deepClone(target);

  function _deepClone(target) {
    if (!isObject(target) && !isArray(target)) {
      return target;
    }
    if (map.has(target)) {
      return target;
    }
    map.set(target, true);

    // inner helpers
    const type = getType(target);
    const isMap = type === TYPES.Map;
    const isSet = type === TYPES.Set;

    let cloneObject;
    if (!canTraverse(type)) {
      cloneObject = handlerUntraverse(target);
      return;
    } else {
      const Cons = target.constructor;
      if (Cons) {
        cloneObject = new Cons();
      } else {
        cloneObject = isArray(target) ? [] : {};
        target.__proto__ && (cloneObject.__proto__ = target.__proto__);
      }
    }

    if (isMap) {
      target.forEach((item, key) => {
        cloneObject.set(key, _deepClone(item));
      });
    }

    if (isSet) {
      target.forEach(item => {
        cloneObject.add(_deepClone(item));
      });
    }

    for (let key in target) {
      if (target.hasOwnProperty(key)) {
        cloneObject[key] = _deepClone(target[key]);
      }
    }

    return cloneObject;
  }
}