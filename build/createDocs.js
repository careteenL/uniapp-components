const fs = require('fs-extra');
const shell = require('shelljs');

const {
  docsDir,
  docsTargetDir,
} = require('./dirName');

function createDocs() {
  // 生成文档
  shell.exec('npm run docs:gen');
  
  // 清空已有文档
  const docExists = fs.existsSync(docsTargetDir)
  if (docExists) {
      fs.removeSync(docsTargetDir);
  }
  // 拷贝文档
  fs.copySync(docsDir, docsTargetDir);
}

module.exports = createDocs;
