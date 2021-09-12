const vscode = require('vscode');
const remove = require('./remove');
/**
 * 转换log语句
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
function provideHover(document, position, token) {
  vscode.window.activeTextEditor.edit(editBuilder => {
    const end = new vscode.Position(vscode.window.activeTextEditor.document.lineCount + 1, 0);
    const code = vscode.window.activeTextEditor.document.getText();
    const text = remove(code);
    editBuilder.replace(new vscode.Range(new vscode.Position(0, 0), end), text);
    vscode.commands.executeCommand('editor.action.formatDocument');
  });
}

module.exports = function (context) {
  // 注册鼠标悬停提示
  context.subscriptions.push(vscode.commands.registerCommand('superlog.remove', provideHover));
};
