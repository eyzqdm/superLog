const vscode = require('vscode');
const compile = require('./compile');

/**
 * 转换log语句
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
function provideHover(document, position, token) {
  vscode.window.activeTextEditor.edit(editBuilder => {
    // 从开始到结束，全量替换˝
    const end = new vscode.Position(vscode.window.activeTextEditor.document.lineCount + 1, 0);
    // 获取当前文件内容
    const code = vscode.window.activeTextEditor.document.getText();
    const text = compile(code);
    editBuilder.replace(new vscode.Range(new vscode.Position(0, 0), end), text);
    vscode.commands.executeCommand('editor.action.formatDocument');
  });
}
module.exports = function (context) {
  // 注册鼠标悬停提示
  context.subscriptions.push(vscode.commands.registerCommand('superlog.trans', provideHover));
};
