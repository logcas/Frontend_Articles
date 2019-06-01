function _instanceof(o, constructor) {
  let proto = o.__proto__;
  while(proto) {
    if(proto === constructor.prototype) return true;
    proto = proto.__proto__;
  }
  return false;
}