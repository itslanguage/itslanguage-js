const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './app/index.jsx',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        options: {},
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: { extensions: ['*', '.js', '.jsx'] },
  output: {
    path: path.resolve(__dirname, '/dist'),
    publicPath: '/dist',
    filename: 'bundle.js',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'app/public/'),
    port: 3000,
    publicPath: 'http://localhost:3000/dist',
    hot: true,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Hot Module Replacement',
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
};
