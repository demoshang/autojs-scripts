const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  devtool: 'hidden-source-map',
  mode: 'production',
  performance: {
    maxAssetSize: 5120000,
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          failOnError: true,
          formatter: require('eslint-formatter-friendly'),
        },
      },
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
          options: {},
        },
        exclude: /node_modules/,
      },
    ],
  },
});
