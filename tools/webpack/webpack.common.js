const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const { root } = require("./constants");
const { getEntry } = require("./entry");
const AutoJsUiPlugin = require("./autojs-ui.plugin");

module.exports = {
  entry: getEntry(),
  output: {
    path: path.resolve(root, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.xml$/,
        use: [
          {
            loader: path.resolve(__dirname, "./autojs-xml.loader.js"),
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".xml"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path
            .join(root, "projects/**/*")
            .split(path.sep)
            .join(path.posix.sep),
          to: path.resolve(root, "dist/").split(path.sep).join(path.posix.sep),
          context: "projects/",
          globOptions: {
            ignore: ["**/*.ts", "**/*.xml"],
          },
        },
      ],
    }),
    new AutoJsUiPlugin(),
  ],
};
