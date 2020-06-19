const path = require("path");

module.exports = {
  mode: "production",
  entry: "./scripts-src/index.js",
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
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
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
    ],
  },
};
