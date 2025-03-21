const env = process.env.NODE_ENV
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const cssLoaders = [
  // { loader: 'style-loader', options: { sourceMap: true } },
  { loader: 'css-loader', options: { importLoaders: 1, sourceMap: true } },
  { loader: 'postcss-loader', options: { sourceMap: true } }
]

module.exports = {
  entry: './src/views/index.js',
  devtool: 'eval',
  output: {
    path: path.resolve(__dirname, './src/assets'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css?$/,
        exclude: /node_modules/,
        use: (
          env === 'production'
            ? ExtractTextPlugin.extract({
              fallback: 'style-loader',
              use: cssLoaders
            })
            : cssLoaders
        )
      }
    ]
  },
  plugins: (
    env === 'production'
      ? [
        new ExtractTextPlugin({
          filename: '[name].css'
        })
      ]
      : []
  ),
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  devServer: {
    contentBase: './dist'
  }
}
