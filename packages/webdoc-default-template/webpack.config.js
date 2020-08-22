const {
  resolve: resolvePath,
} = require("path");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

module.exports = {
  optimization: {
    minimizer: [new OptimizeCSSAssetsPlugin({})],
  },
  mode: process.env.NODE_ENV || "production",
  entry: {
    "default-template": [
      "./src/app/index.js",
      "./src/styles/index.scss",
    ],
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
    "react-markdown": "ReactMarkdown",
  },
  output: {
    path: resolvePath(__dirname, "static/"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-flow",
            ],
          },
        },
      },
      {
        test: /\.(css|scss|sass)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "../styles/[name].css",
            },
          },
          "extract-loader",
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
};
