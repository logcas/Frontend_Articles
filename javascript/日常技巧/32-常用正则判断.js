// 模拟trim方法
function trim1(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

function trim2(str) {
  return str.replace(/^\s*(.*?)\s*$/g, '$1');
}

const a = '    fsafnjksnjk nnj nskj nkn   ';
console.log(trim1(a));
console.log(trim2(a));

// 将一个句子中所有单词的首字母变为大写字母
function firstLetterUpperCase(str) {
  return str.replace(/(^|\s)\w/g, s => s.toUpperCase());
}

const regx = /\b[a-zA-Z]+\b/g;
const b = 'hello, i am tony, how are you?';
console.log(firstLetterUpperCase(b));

// 命名驼峰化
// get-something-from-network => getSomethingFromNetwork
function toCamelCase(name) {
  return name.replace(/[-_]+(.)?/g, (match, $1) => {
    return $1 ? $1.toUpperCase() : '';
  });
}

const c = 'get-something-from-network';
console.log(toCamelCase(c));

// 中划线化
// getSomethingFromNetwork => get-something-from-network
function dasherize(name) {
  return name.replace(/[A-Z]/g, match => {
    return '-' + match.toLowerCase();
  });
}

const d = 'getSomethingFromNetworK';
console.log(dasherize(d));

// 匹配标签
function testTagString(str) {
  return /<([^>]+)>[^<>]*<\/\1>/.test(str);
}

const e = '<title>regular expression</title>';
const f = '<title>wrong!</p>';
console.log(testTagString(e));
console.log(testTagString(f));