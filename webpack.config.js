import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default (env, argv = {}) => {
  const mode = argv.mode || 'production';

  return {
    mode,
    entry: {
      popup: './src/components/popup.ts',
      background: './src/background.ts',
      'content-script': './src/content-script.ts'
    },
    output: {
      filename: '[name].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-typescript']
            }
          },
          exclude: /node_modules/
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader']
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: 'popup.html',
        template: 'src/popup.html',
        chunks: ['popup']
      }),
      new CopyPlugin({
        patterns: [
          { from: 'src/manifest.json', to: '.' },
          { from: 'src/assets', to: 'assets' },
          { from: '_locales', to: '_locales' }
        ]
      }),
      new MiniCssExtractPlugin()
    ],
    devtool: mode === 'development' ? 'source-map' : 'hidden-source-map'
  }
}
