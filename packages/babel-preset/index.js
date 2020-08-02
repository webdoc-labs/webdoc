module.exports = function() {
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "current",
          },
        },
      ],
      "@babel/preset-react",
    ],
    plugins: [
      "@babel/plugin-transform-flow-comments",
      "@babel/plugin-proposal-class-properties",
    ],
    comments: false,
  };
};
