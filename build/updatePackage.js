const path = require('path');
const fs = require('fs-extra');

const {
  mpui,
  root,
} = require('./dirName');

function updatePackage () {
  // 打包目录的package.json
  const mpuiPackagePath = path.join(mpui, 'package.json');
  // 读取根节点package.json内容
  let mpuiData = fs.readFileSync(path.join(root, 'package.json'), 'utf-8');
  mpuiData = JSON.parse(mpuiData);
  // 读取打包目录的package.json内容
  let mpuiPackageData = fs.readFileSync(mpuiPackagePath, 'utf-8');
  // 转换成json
  mpuiPackageData = JSON.parse(mpuiPackageData);
  // 将version重新赋值
  mpuiPackageData.version = mpuiData.version;

  // 输出到打包目录的package.json
  fs.outputFileSync(mpuiPackagePath, JSON.stringify(mpuiPackageData, '', 2));
}

module.exports = updatePackage;
