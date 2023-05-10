const CopyWebpackPlugin = require('copy-webpack-plugin');
const DotenvWebpack = require('dotenv-webpack');


module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  plugins: [
    new DotenvWebpack(),

    new CopyWebpackPlugin({
      patterns: [
        { from: './src/agent/state_of_the_union.txt', to: './' },
      ],
    }),
  ],

  entry: './src/main.js',
  // Put your normal webpack config below here
  module: {
    rules: require('./webpack.rules'),
  },
  resolve: {
    modules: ['node_modules', 'src'], // Add your 'src' directory here
    extensions: ['.js', '.jsx', '.json'],
  },

};
