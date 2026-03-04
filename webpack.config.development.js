/* eslint-disable max-len */
/**
 * Build config for development process that uses Hot-Module-Replacement
 * https://webpack.js.org/concepts/hot-module-replacement/
 */
import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import { spawn } from 'child_process';
import baseConfig from './webpack.config.base';
import pkg from './package.json';

const port = process.env.PORT || 3000;
const publicPath = `http://localhost:${port}/dist`;
// const publicPath = `http://10.0.0.219:${port}/public`;

const devEntry = [
  'react-hot-loader/patch',
  `webpack-dev-server/client?http://localhost:${port}/`,
  // `webpack-dev-server/client?http://10.0.0.219:${port}/`,
  'webpack/hot/only-dev-server'
];

let theme = {};
if (pkg.theme && typeof(pkg.theme) === 'string') {
  let cfgPath = pkg.theme;
  const getThemeConfig = require(cfgPath);
  theme = getThemeConfig();
} else if (pkg.theme && typeof(pkg.theme) === 'object') {
  theme = pkg.theme;
}

export default merge(baseConfig, {
  devtool: 'source-map',

  entry: {
    'app': [
      ...devEntry,
      path.join(__dirname, 'app/index.js'),
    ],
    'login': [
      ...devEntry,
      path.join(__dirname, 'app/wins/login/index.js'),
    ]
  },

  output: {
    filename: '[name].bundle.js',
    publicPath: `http://localhost:${port}/dist/`
    // publicPath: `http://10.0.0.219:${port}/dist/`
  },

  module: {
    rules: [
      {
        test: /\.global\.css$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          }
        ]
      },
      {
        test: /^((?!\.global).)*\.css$/,
        include: [path.resolve(__dirname, 'node_modules')],
        use: [
          {loader : 'style-loader'},
          {loader : 'css-loader' }
        ]
      },
      {
        test: /^((?!\.global).)*\.css$/,
        exclude: [
          path.resolve(__dirname, "node_modules")
        ],
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: '[name]__[local]__[hash:base64:5]',
            }
          },
        ]
      },
      // 单独为 antd 的 css 设置一条加载器规则
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader'
          }, {
            loader: 'less-loader',
            options: {
              sourceMap: true,
              modifyVars: theme
            }
          }
        ],
        include: [
          path.resolve(__dirname, "node_modules/antd")
        ]
      },
      // 普通 json 文件加载器
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          }
        },
      },
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          }
        }
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream'
          }
        }
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          }
        }
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      },
      {
        test: /\.worker\.js$/,
        exclude: /node_modules/,
        use: 'worker-loader'
      },
      {
        test: /\.html$/,
        use: [ {
          loader: 'html-loader',
          options: {
            minimize: true
          }
        }]
      }
    ]
  },

  plugins: [
    // https://webpack.js.org/concepts/hot-module-replacement/
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    // turn debug mode on.
    new webpack.LoaderOptionsPlugin({
      debug: true
    })
  ],

  /**
   * https://github.com/chentsulin/webpack-target-electron-renderer#how-this-module-works
   */
  target: 'electron-renderer',
  devServer: {
    port,
    hot: true,
    inline: true,
    historyApiFallback: {
      verbose: true,
      index: '/app/app.html'
    },
    publicPath,
    setup() {
      if (process.env.START_HOT) {
        spawn('npm', ['run', 'start-hot'], { shell: true, env: process.env, stdio: 'inherit' })
          .on('close', code => process.exit(code))
          .on('error', spawnError => console.error(spawnError));
      }
    }
  },
});
