const path = require('path')

module.exports = {
  entry: './src/code.ts',
  devtool: 'inline-source-map',
  mode: 'development',
  devServer: {
    static: './',
    port: 8080,
    historyApiFallback: {
      index: '/index.html'
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx']
  },
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  }
}
