const { difference } = require('lodash');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const WebpackWriteStatsPlugin = require('webpack-write-stats-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

console.log(`webpack running in ${NODE_ENV} mode`);

loadClientVars();

module.exports = {
  cache: true,
  context: path.resolve(__dirname, 'src/'),
  // devtool: 'cheap-module-source-map', // React 16's suggestion: https://reactjs.org/docs/cross-origin-errors.html#webpack
  entry: {
    main: path.resolve(__dirname, 'src/application.js'),
    styles: path.resolve(__dirname, 'src/stylesheets/application.scss'),
  },
  output: {
    filename: 'bundle-[name].js',
    chunkFilename: 'bundle-[name].js',
    path: path.resolve(__dirname, `www`),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
    modules: [
      path.resolve(__dirname, 'src/'),
      'node_modules',
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(__dirname, 'www/env.js'),
        include: path.join(__dirname, 'src/'),
        exclude: /node_modules/,
        use: [{ loader: 'babel-loader' }],
      },
      {
        test: /\.scss$/,
        include: path.join(__dirname, 'src/stylesheets'),
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'postcss-loader' },
          { loader: 'sass-loader' },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
      },
    }),
    new WebpackWriteStatsPlugin(path.resolve(__dirname, 'config/webpack.json'), {
      chunks: false,
      modules: false,
    }),
    !isProduction ? new ProgressBarPlugin() : null,
    !isProduction ? new WebpackNotifierPlugin({ alwaysNotify: true }) : null,
  ].filter(i => i),
};

function loadClientVars () {
  let clientVars;

  try {
    // look for config/.client first
    const configPath = path.resolve(__dirname, `config/.client`);
    let data = fs.readFileSync(configPath);
    clientVars = JSON.parse(data.toString('utf8'));
    console.log(`Found client vars in ${configPath}`);
  } catch (ex) {
    console.warn("Couldn't find config/.client", ex);
  }

  if (!clientVars) {
    try {
      // if not, look for environment-specific file
      const configPath = path.resolve(__dirname, `config/.client.${NODE_ENV}`);
      let data = fs.readFileSync(configPath);
      clientVars = JSON.parse(data.toString('utf8'));
      console.log(`Found client vars in ${configPath}`);
    } catch (ex) {
      throw new Error(`Couldn't find client vars. Tried config/.client.${NODE_ENV}`, ex);
    }
  }

  if (clientVars) {
    const envJS = `const env = ${JSON.stringify(clientVars)};\nexport default env;`;
    fs.writeFileSync(path.join(__dirname, `www/env.js`), envJS);
  }
}
