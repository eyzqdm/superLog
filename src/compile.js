const generator = require('@babel/generator');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const types = require('@babel/types');
const trans = require('./trans');
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
const compile = code => {
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
          const ParentNodeName = findParent(path);
          const JsxElement = findJsxElement(path);
          const prefix = `${JsxElement ?? ''} ${ParentNodeName ?? ''}`.replace(/(^\s*)|(\s*$)/g, '');
          const PrefixNodeName = types.stringLiteral(prefix ?? '');
          const newArg = trans(path.node.arguments);
          path.node.arguments = PrefixNodeName?.value ? [PrefixNodeName, ...newArg] : [...newArg];
        }
      }
    },
  };

  traverse.default(ast, visitor);
  const newCode = generator.default(ast, { retainLines: true, retainFunctionParens: true }, code).code;
  return newCode;
};

module.exports = compile;
