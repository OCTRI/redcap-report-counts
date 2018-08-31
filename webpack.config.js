/* eslint-env node */
const path = require('path');
const webpack = require('webpack');

const packageJson = require('./package.json');
const repoInfo = require('git-repo-info')();

const { DefinePlugin, LoaderOptionsPlugin } = webpack;

module.exports = {
  externals: {
    jquery: 'jQuery'
  },
  entry: {
    app: [
      __dirname + '/node_modules/babel-polyfill/dist/polyfill.js',
      './js/main.js'
    ]
  },
  output: {
    path: path.join(__dirname, 'lib', 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'var',
    library: 'ConsortReport'
  },
  module: {
    noParse: [/\/babel-polyfill\/dist\/polyfill\.js$/],
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          presets: ['env']
        }
      },
      {
        test: /\.html$/,
        loader: 'file-loader?name=[name].[ext]'
      }
    ]
  },
  devtool: 'cheap-source-map',
  plugins: [
    new LoaderOptionsPlugin({
      options: {
      }
    }),
    new DefinePlugin({
      CONSORT_REPORT_VERSION: JSON.stringify(packageJson.version),
      CONSORT_REPORT_GIT_HASH: JSON.stringify(repoInfo.abbreviatedSha)
    })
  ]
};
