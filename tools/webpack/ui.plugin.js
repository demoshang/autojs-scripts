const { ConcatSource } = require('webpack-sources');

class AutoJsUiPlugin {
  constructor(uiFiles) {
    this.uiFiles = uiFiles;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('AutoJsUiPlugin', (compilation) => {
      compilation.hooks.optimizeChunkAssets.tap('AutoJsUiPlugin', (chunks) => {
        for (const chunk of chunks) {
          if (chunk.canBeInitial()) {
            if (this.uiFiles[chunk.name]) {
              chunk.files.forEach((file) => {
                compilation.assets[file] = new ConcatSource(
                  '"ui";',
                  '\n',
                  this.uiFiles.all ? this.uiFiles.all : '',
                  '\n',
                  this.uiFiles[chunk.name] ? this.uiFiles[chunk.name] : '',
                  '\n',
                  `function __RUN_TASK__() {
                      require('./task.js');
                    }`,
                  '\n',
                  compilation.assets[file]
                );
              });
            }
          }
        }
      });
    });
  }
}

module.exports = AutoJsUiPlugin;
