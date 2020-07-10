const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/ui.js',
    code: './src/code.js'
  },

  output: {
    filename: '[name].js',
    path: __dirname + '/dist/'
  },

  plugins: [
    new HtmlWebpackPlugin({
      cache: false,
      template: './src/ui.html',
      filename: 'ui.html',
      inlineSource: '.(js)$',
    }),
    new HtmlWebpackInlineSourcePlugin(HtmlWebpackPlugin),
  ],
})
