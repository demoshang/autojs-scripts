const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

const { root } = require('./constants');
const { getEntry } = require('./entry');
const { getUiFiles } = require('./ui-files');
const AutoJsUiPlugin = require('./ui.plugin');

module.exports = {
  entry: getEntry(),
  output: {
    path: path.join(root, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  plugins: [
    new CopyPlugin([
      {
        from: path.join(root, 'projects/**/*'),
        to: path.join(root, 'dist/'),
        context: 'projects/',
        ignore: ['*.ts', '*.js', '*.xml'],
      },
    ]),
    new AutoJsUiPlugin(getUiFiles()),
  ],
};
