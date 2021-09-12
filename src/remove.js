const generator = require('@babel/generator');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const types = require('@babel/types');

const remove = code => {
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
          path.remove();
        }
      }
    },
  };

  traverse.default(ast, visitor);
  const newCode = generator.default(ast, { retainLines: true, retainFunctionParens: true }, code).code;
  return newCode;
};

module.exports = remove;
