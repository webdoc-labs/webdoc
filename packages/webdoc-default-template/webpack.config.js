const path = require("path");

module.exports = {
  mode: "development",
  entry: "./scripts-src/index.js",
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
    "react-markdown": "ReactMarkdown",
  },
  output: {
    path: path.resolve(__dirname, "static/scripts"),
    filename: "default-template.js",
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-flow"],
          },
        },
      },
    ],
  },
};
