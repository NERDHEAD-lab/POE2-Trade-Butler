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
          { from: "src/manifest.json", to: "manifest.json" },
          { from: "src/css/styles.css", to: "styles.css" }, // styles.css만 루트로 이동
          { from: "src/css/*.css", to: "css/[name].css", filter: (resourcePath) => !resourcePath.endsWith("styles.css") },
          { from: "src/components/*.html", to: "components/[name].html" },
          { from: "src/assets/*.png", to: "assets/[name].png" },
          ...(isDev
            ? [
              // 개발 모드에서 JS 파일 복사
              { from: "src/*.js", to: "[name].js" },
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
