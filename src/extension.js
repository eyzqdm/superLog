/**
 * 插件被激活时触发，所有代码总入口
 * @param {*} context 插件上下文
 */
exports.activate = function (context) {
  console.log('superLog已被激活');
  require('./transLog')(context);
  require('./removeLog')(context);
  require('./recoveryLog')(context);
};

/**
 * 插件被释放时触发
 */
exports.deactivate = function () {
  console.log('superLog已被释放');
};
