module.exports = function() {
  return {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "current",
          },
          exclude: [
            "proposal-dynamic-import"
          ]
        },
      ],
      "@babel/preset-react",
    ],
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-transform-flow-comments",
    ],
    comments: false,
  };
};
