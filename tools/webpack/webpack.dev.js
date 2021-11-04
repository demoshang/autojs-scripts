const { merge } = require("webpack-merge");
const ESLintPlugin = require("eslint-webpack-plugin");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  devtool: "hidden-source-map",
  mode: "development",

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
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

  plugins: [
    new ESLintPlugin({
      extensions: ["ts"],
      emitWarning: true,
      formatter: require("eslint-formatter-friendly"),
    }),
  ],
});
