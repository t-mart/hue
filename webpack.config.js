const  path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  devtool: "cheap-eval-source-map",
  entry: './app.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, "dist"),
  },
  devServer: {
    watchContentBase: true,
    publicPath: "/dist/",
    overlay: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      {
        test: require.resolve('d3'),
        use: [{
          loader: 'expose-loader',
          options: 'd3'
        }]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("styles.css"),
  ]
};