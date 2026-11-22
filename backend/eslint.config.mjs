import js from "@eslint/js";
import tseslint from "typescript-eslint";

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

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "tests/**/*.ts"],
    languageOptions: { globals: nodeGlobals },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
