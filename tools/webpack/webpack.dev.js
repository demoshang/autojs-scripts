const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'none',
  mode: 'development',

  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          emitWarning: true,
          formatter: require('eslint-formatter-friendly'),
        },
      },
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {
            // 6133: declared but its value is never read
            // 6192: All imports in import declaration are unused.
            ignoreDiagnostics: [6133, 6192],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
});
