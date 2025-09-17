import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import CopyPlugin from 'copy-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import fs from 'fs';
import crypto from 'crypto';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const privateKeyFilePath = path.resolve(__dirname, 'dev_key.pem');
const publicKeyFilePath = path.resolve(__dirname, 'dev_key.pub');

export default (env, argv = {}) => {
  const mode = argv.mode || 'production';
  const isDev = mode === 'development';
  const tsconfigFile = isDev ? 'tsconfig.dev.json' : 'tsconfig.json';

  return {
    mode,
    devtool: isDev ? 'inline-source-map' : false,
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
          test: /\.[jt]sx?$/,
          use: {
            loader: 'babel-loader',
            options: {
              sourceMaps: isDev,
              presets: [
                ...(isDev ? [[
                  '@babel/preset-env',
                  {
                    targets: { chrome: '120' },
                    bugfixes: true,
                    modules: false,
                    exclude: [
                      '@babel/plugin-transform-async-to-generator',
                      '@babel/plugin-transform-regenerator'
                    ]
                  }
                ]] : []),
                '@babel/preset-typescript'
              ]
            }
          },
          exclude: /node_modules/
        },
        {
          test: /\.css$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader']
        },
        {
          test: /\.scss$/i,
          use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]'
          }
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
          {
            from: 'src/manifest.json',
            to: '.',
            transform(content) {
              const manifest = JSON.parse(content.toString());

              if (fs.existsSync(privateKeyFilePath) && isDev) {
                const privateKey = fs.readFileSync(privateKeyFilePath, 'utf8');
                const keyObject = crypto.createPrivateKey(privateKey);

                const publicKeyDer = keyObject.export({
                  type: 'spki',
                  format: 'der'
                });

                manifest.key = publicKeyDer.toString('base64');
                console.log('Development key added to manifest.json from private key.');

              } else if (fs.existsSync(publicKeyFilePath) && isDev) {
                const publicKey = fs.readFileSync(publicKeyFilePath, 'utf8');
                const keyObject = crypto.createPublicKey(publicKey);

                const derKey = keyObject.export({
                  type: 'spki',
                  format: 'der'
                });

                manifest.key = derKey.toString('base64');
                console.log('Development key added to manifest.json from public key.');

              } else if (isDev) {
                console.warn('Warning: Development key file not found. A new extension ID will be generated on each load. To fix this, create a dev_key.pem or dev_key.pub file in the project root.');
              }


              console.log(`Building for ${isDev ? 'development' : 'production'} mode.`);
              return Buffer.from(JSON.stringify(manifest, null, 2));
            }
          },
          { from: 'src/assets', to: 'assets' },
          { from: '_locales', to: '_locales' }
        ]
      }),
      new MiniCssExtractPlugin(),
      new ForkTsCheckerWebpackPlugin({
        typescript: { configFile: tsconfigFile }
      })
    ],
    optimization: { minimize: !isDev }
  };
};
