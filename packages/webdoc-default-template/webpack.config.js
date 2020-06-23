const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    "default-template": ["./src/app/index.js", "./src/styles/index.less"],
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
    "react-markdown": "ReactMarkdown",
  },
  output: {
    path: path.resolve(__dirname, "static/"),
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
            presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-flow"],
          },
        },
      },
      {
        test: /\.(css|less)$/i,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "../styles/[name].css",
            },
          },
          "extract-loader",
          "css-loader",
          "less-loader",
        ],
      },
    ],
  },
};
