const fs = require('fs');
const { RawSource } = require('webpack-sources');

const { xmlMatchRegExp } = require('./constants');

function appendHeader(source) {
  const headers = /(^|\n)\s*(['"])ui\2/.test(source) ? `"ui";` : '';

  return `${headers}\n${source}`;
}

function transformXml(xmlContent) {
  const wrapMatches = xmlContent.match(/<!--\s*wrap:\s*([\w.-]+)\s*-->/);

  let wrap = 'ui.layout';

  if (wrapMatches) {
    wrap = wrapMatches[1];
  }

  return `${wrap}(
    ${xmlContent}
  )`;
}

function appendXML(source) {
  return source.replace(xmlMatchRegExp, (match, quote, xmlPath) => {
    const xmlContent = fs.readFileSync(xmlPath, { encoding: 'utf8' });

    return `(
${xmlContent}
)`;
  });
}

class AutoJsUiPlugin {
  constructor() {}

  apply(compiler) {
    compiler.hooks.compilation.tap('AutoJsUiPlugin', (compilation) => {
      compilation.hooks.optimizeChunkAssets.tap('AutoJsUiPlugin', (chunks) => {
        for (const chunk of chunks) {
          if (chunk.canBeInitial()) {
            chunk.files.forEach((file) => {
              let source = compilation.assets[file].source();
              source = appendHeader(source);
              source = appendXML(source);

              compilation.assets[file] = new RawSource(source);
            });
          }
        }
      });
    });
  }
}

module.exports = AutoJsUiPlugin;
