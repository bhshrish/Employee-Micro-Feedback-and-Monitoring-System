import js from "@eslint/js";

const nodeGlobals = {
  Buffer: "readonly",
  __dirname: "readonly",
  clearInterval: "readonly",
  clearTimeout: "readonly",
  console: "readonly",
  exports: "readonly",
  fetch: "readonly",
  global: "readonly",
  module: "readonly",
  process: "readonly",
  require: "readonly",
  setImmediate: "readonly",
  setInterval: "readonly",
  setTimeout: "readonly",
};

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["src/**/*.js", "tests/**/*.js"],
    languageOptions: { globals: nodeGlobals },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
];
