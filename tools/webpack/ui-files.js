const glob = require('glob');
const fs = require('fs');

const { projectsDir } = require('./constants');

function getDefine(xmlPath) {
  const xmlContent = fs.readFileSync(xmlPath, { encoding: 'utf8' });
  const keyMatches = xmlContent.match(/<!-- key: ([a-zA-Z][-\w]+) -->/);
  const wrapMatches = xmlContent.match(/<!-- wrap: ([\w.-]+) -->/);

  let key = '__not_declare__';
  let wrap = 'ui.layout';

  if (keyMatches) {
    key = keyMatches[1];
  }

  if (wrapMatches) {
    wrap = wrapMatches[1];
  }

  return `
${key}() {
  return ${wrap}(
    ${xmlContent}
  );
},`;
}

function append(result, xmlPath, type) {
  // 检测 main 文件是否需要添加  "ui"
  const fileKey = xmlPath.replace(projectsDir + '/', '').replace(/\/([-\w]+)\.xml$/, `/${type}`);

  try {
    fs.accessSync(`${projectsDir}/${fileKey}.ts`);

    result[fileKey] = ' ';
  } catch (e) {}
}

function getUiFiles() {
  let uiMapStr = '';
  const result = glob.sync(projectsDir + '/**/*.xml').reduce((result, xmlPath) => {
    // 将所有xml文件转译
    uiMapStr += `\n${getDefine(xmlPath)}`;

    append(result, xmlPath, 'main');

    return result;
  }, {});

  result.all = `const UI_XML_MAP = {${uiMapStr}};`
  return result;
}

module.exports = { getUiFiles };
