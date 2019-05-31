function inherit(subType, superType) {
  subType.prototype = Object.create(superType, {
    constructor: {
      configurable: true,
      writable: true,
      enumerable: false,
      value: subType
    }
  });
  // subType.__proto__ = superType;
  // 这里主要是为了继承构造函数上的静态方法和属性
  Object.setPrototypeOf(subType, superType);
}