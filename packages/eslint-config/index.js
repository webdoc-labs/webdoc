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
    $Keys: "readonly",
    $Values: "readonly",
    $ReadOnly: "readonly",
    $Exact: "readonly",
    $Diff: "readonly",
    $Rest: "readonly",
    $PropertyType: "readonly",
    $ElementType: "readonly",
    $NonMaybeType: "readonly",
    $ObjMap: "readonly",
    $ObjMapi: "readonly",
    $TupleMap: "readonly",
    $Call: "readonly",
    Class: "readonly",
    $Shape: "readonly",
    $Exports: "readonly",
    $Supertype: "readonly",
    $Subtype: "readonly",
    $ReadOnlyArray: "readonly",
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
  overrides: [
    {
      files: ["*.js", "*.jsx"],
      parser: "@babel/eslint-parser",
      parserOptions: {
        ecmaVersion: 2018,
      },
    },
    {
      files: ["*.mjs"],
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module"
      }
    }
  ]
};
