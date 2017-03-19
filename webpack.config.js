const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  devtool: "source-map",
  entry: './app.js',
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, "dist"),
  },
  devServer: {
    watchContentBase: true,
    publicPath: "/dist/",
    overlay: true,
    host: "0.0.0.0"
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
        test: require.resolve('./hue.js'),
        use: [{
          loader: 'expose-loader',
          options: 'hue'
        }]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("styles.css"),
  ]
};