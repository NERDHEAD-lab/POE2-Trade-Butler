const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");


module.exports = (env, argv = {}) => {
  const mode = argv.mode || "production";
  const isDev = mode === "development";

  return {
    mode,
    entry: {
      popup: "./src/popup.ts",
      background: "./src/background.ts",
      "content-script": "./src/content-script.ts",
      ...(isDev ? { development: "./src/development.ts" } : {})
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist"),
      clean: true
    },
    resolve: {
      extensions: [".ts", ".js"]
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: "babel-loader",
          exclude: /node_modules/
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, "css-loader"]
        }
      ]
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "src/manifest.json", to: "." },
          { from: "src/assets", to: "assets" },
          { from: "src/popup.html", to: "." },
        ]
      }),
      ...(isDev ? [
        new HtmlWebpackPlugin({
          filename: "development.html",
          template: "src/development.html",
          chunks: ["development"],
          inject: "body",
          favicon: "src/assets/icon.png"
        })
      ] : []),
      new MiniCssExtractPlugin()
    ],
    devtool: isDev ? "eval-cheap-module-source-map" : false,
    ...(isDev && {
      devServer: {
        static: {
          directory: path.join(__dirname, "dist"),
        },
        open: ['/development.html'],
        hot: true,
        compress: true,
        port: 8080
      }
    })
  };
};