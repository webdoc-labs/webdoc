require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    mocha: true,
    node: true,
  },
  extends: ["eslint:recommended", "google", "plugin:import/errors"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    $Shape: "readonly",
    $ReadOnlyArray: "readonly",
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "require-jsdoc": "off",
    "max-len": [
      "error",
      {
        code: 100,
      },
    ],
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "spaced-comment": "off",
    "sort-imports": [
      "error",
      {
        ignoreCase: false,
        ignoreDeclarationSort: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
      },
    ],
    "import/no-unresolved": [
      "error",
      {
        ignore: ["react", "react-dom"],
      },
    ],
    "react/jsx-uses-vars": "error",
  },
  plugins: [
    "eslint-plugin-flow",
    "eslint-plugin-import",
    "eslint-plugin-react",
  ],
};
