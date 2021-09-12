const types = require('@babel/types');
const LiteralSet = new Set([
  'StringLiteral',
  'TemplateLiteral',
  'NumericLiteral',
  'RegExpLiteral',
  'BooleanLiteral',
  'BigintLiteral',
  'NullLiteral',
]);
const getNodeName = node => {
  const getPreValue = node => {
    if (node.object && node.property) {
      if (node.property.name) {
        return `${node.property.name}.${getPreValue(node.object)}`;
      } else {
        return `[${node.property.value}].${getPreValue(node.object)}`;
      }
    } else {
      return node.name;
    }
  };
  return getPreValue(node)
    .split('.')
    .reverse()
    .map((item, index, arr) => (index === arr.length - 1 || arr[index + 1][0] === '[' ? item : `${item}.`))
    .join('');
};
const getCallExpArgs = argList => {
  if (!argList.length) {
    return '()';
  }
  const res = [];
  argList.forEach((node, index) => {
    if (LiteralSet.has(node.type)) {
      res.push(node.value);
    } else {
      const strNodeName = actionMap[node.type] ? actionMap[node.type](node) : '';
      res.push(strNodeName);
    }
  });
  return `(${res.map((item, index, arr) => (index === arr.length - 1 ? item : `${item},`)).join('')})`;
};
const actionMap = {
  // 调用表达式
  CallExpression: node => getNodeName(node.callee) + getCallExpArgs(node.arguments),
  // 标识符
  Identifier: node => node.name,
  // 成员表达式
  MemberExpression: node => getNodeName(node),
  // 字符串
  StringLiteral: () => '',
};

const trans = list => {
  let res = new Array(list.length * 2).fill(null);
  list.forEach((node, index) => {
    res[index * 2 + 1] = node;
    const strNodeName = actionMap[node.type] ? actionMap[node.type](node) : '';
    res[index * 2] = strNodeName ? types.stringLiteral(`${strNodeName}-------`) : '';
  });
  return res;
};
module.exports = trans;
