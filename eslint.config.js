const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const unusedImports = require("eslint-plugin-unused-imports");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-inline-comments": "error",
      "unused-imports/no-unused-imports": "error",
    },
  },
]);
