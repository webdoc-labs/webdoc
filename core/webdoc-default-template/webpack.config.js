const {
  resolve: resolvePath,
} = require("path");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), "..."],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "styles/index.css",
    }),
  ],
  mode: process.env.NODE_ENV || "production",
  entry: {
    core: {
      import: ["./src/app/index.js", "./src/styles/index.scss"],
      filename: "scripts/default-template.js",
    },
    sw: {
      import: ["./src/service-worker/index.js"],
      filename: "service-worker.js",
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
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
    ],
  },
};
