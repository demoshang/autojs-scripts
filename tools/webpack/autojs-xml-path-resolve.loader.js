const path = require('path');

const { xmlMatchRegExp } = require('./constants');

function autoJsXmlPathResolveLoader(content) {
  return content.replace(xmlMatchRegExp, (match, quote, xmlRelativePath) => {
    const absolutePath = path.resolve(this.resourcePath, '../', xmlRelativePath);
    return `(${quote}${absolutePath}${quote})`;
  });
}

module.exports = autoJsXmlPathResolveLoader;
