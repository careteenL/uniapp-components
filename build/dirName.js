const path = require('path');
// 定义目录
// 源components
const packages = path.join(__dirname, '../src/components');
// 目标文件夹(packages)
const mpui = path.join(__dirname, '../packages');
// 目标components(packages/components)
const targetDir = path.join(mpui, 'components');
// 根目录
const root = path.join(__dirname, '../');
// 文档源目录(/docs)
const docsDir = path.join(__dirname, '../docs');
// 文档目标目录(/packages/docs)
const docsTargetDir = path.join(mpui, 'docs');

module.exports = {
  packages,
  mpui,
  targetDir,
  root,
  docsDir,
  docsTargetDir,
};
