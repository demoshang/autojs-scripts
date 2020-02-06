const fs = require('fs');
const { RawSource } = require('webpack-sources');

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
  const regexp = /module.exports="__XML_TRANSFORM_BEGIN__([\d\D]*?)__XML_TRANSFORM_END__"/g;

  return source.replace(regexp, (match, xmlPath) => {
    const xmlContent = fs.readFileSync(xmlPath, { encoding: 'utf8' });

    return `module.exports = function() {
      global.__ARGS__ = [].slice.call(arguments); 
      global.__ARG0__ = global.__ARGS__[0]; 
      global.__ARG1__ = global.__ARGS__[1]; 
      global.__ARG2__ = global.__ARGS__[2]; 
      global.__ARG3__ = global.__ARGS__[3]; 
      global.__ARG4__ = global.__ARGS__[4]; 
      global.__ARG5__ = global.__ARGS__[5]; 
      global.__ARG6__ = global.__ARGS__[6]; 
      global.__ARG7__ = global.__ARGS__[7]; 
      global.__ARG8__ = global.__ARGS__[8]; 
      global.__ARG9__ = global.__ARGS__[9]; 
      return ${transformXml(xmlContent)}};
`
  });
}

class AutoJsUiPlugin {
  constructor() {
  }

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
