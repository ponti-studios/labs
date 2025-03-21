const HtmlPlugin = require('html-webpack-plugin')

module.exports = {
  plugins: [new HtmlPlugin({title: 'Kensho FE Practical'})],
  devtool: 'cheap-module-source-map',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader?cacheDirectory',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  serve: {open: true},
}
