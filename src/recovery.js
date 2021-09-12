const generator = require('@babel/generator');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const types = require('@babel/types');
const findParent = path => {
  const ParentNode = path.findParent(
    parent => parent.type === 'ArrowFunctionExpression' || parent.type === 'FunctionDeclaration'
  );
  if (!ParentNode) {
    return null;
  }
  if (ParentNode.type === 'FunctionDeclaration') {
    return ParentNode?.node?.id?.name;
  } else if (ParentNode.type === 'ArrowFunctionExpression') {
    return ParentNode?.parent?.id?.name;
  }
};
const findJsxElement = path => {
  const JsxElement = path.findParent(parent => parent.type === 'JSXOpeningElement');
  const EventName = path.findParent(parent => parent.type === 'JSXAttribute');
  return `${JsxElement?.node?.name?.name ?? ''} ${EventName?.node?.name?.name ?? ''}`;
};
const recovery = code => {
  const ast = parser.parse(code, {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
  const visitor = {
    CallExpression(path) {
      const { callee } = path.node;
      if (types.isCallExpression(path.node) && types.isMemberExpression(callee)) {
        const { object, property } = callee;
        if (object.name === 'console' && property.name === 'log') {
          let newArg = [...path.node.arguments].filter(
            node => node.type !== 'StringLiteral' || node.value.indexOf('-------') === -1
          );
          const ParentNodeName = findParent(path);
          const JsxElement = findJsxElement(path);
          const prefix = `${JsxElement ?? ''} ${ParentNodeName ?? ''}`.replace(/(^\s*)|(\s*$)/g, '');
          if (prefix) {
            newArg = [...newArg.filter(i => i.type !== 'StringLiteral' || i.value !== prefix)];
          }
          path.node.arguments = [...newArg];
        }
      }
    },
  };
  traverse.default(ast, visitor);
  const newCode = generator.default(ast, { retainLines: true, retainFunctionParens: true }, code).code;
  return newCode;
};
module.exports = recovery;
