const {
  resolve: resolvePath,
} = require("path");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), "..."],
  },
  mode: process.env.NODE_ENV || "production",
  entry: {
    core: {
      import: ["./src/app/index.js", "./src/styles/index.scss"],
      filename: "scripts/default-template.js",
    },
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
              name: "styles/[name].css",
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
