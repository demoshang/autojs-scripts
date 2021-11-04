const { merge } = require("webpack-merge");
const ESLintPlugin = require("eslint-webpack-plugin");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  devtool: "hidden-source-map",
  mode: "production",
  performance: {
    maxAssetSize: 5120000,
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {},
        },
        exclude: /node_modules/,
      },
    ],
  },

  plugins: [
    new ESLintPlugin({
      extensions: ["ts"],
      failOnError: true,
      formatter: require("eslint-formatter-friendly"),
    }),
  ],
});
