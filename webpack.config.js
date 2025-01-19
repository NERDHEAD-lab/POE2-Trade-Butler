const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = (env, argv) => {
  const isDev = argv.mode === "development";

  return {
    mode: isDev ? "development" : "production",
    entry: {
        background: "./src/background.js",
        content: "./src/content.js",
        popup: "./src/popup.js",
      },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
    },
    devtool: isDev ? "inline-source-map" : "source-map",
    module: {
      rules: isDev
        ? [] // 개발 모드에서는 로더 비활성화
        : [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
            },
          },
        ],
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          { from: "src/styles.css", to: "styles.css" },
          { from: "src/manifest.json", to: "manifest.json" },
          { from: "src/components/**/*.html", to: "components/[name].html" },
          { from: "src/icon.png", to: "icon.png" },
          ...(isDev
            ? [
              // 개발 모드에서 JS 파일 복사
              { from: "src/background.js", to: "background.js" },
              { from: "src/content.js", to: "content.js" },
              { from: "src/popup.js", to: "popup.js" },
            ]
            : []),
        ],
      }),
    ],
    optimization: {
      minimize: !isDev, // 개발 모드에서는 코드 최소화 비활성화
      splitChunks: false, // 코드 분할 비활성화
    },
    watch: isDev,
  };
};
