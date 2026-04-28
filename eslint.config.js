import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "no-console": "warn",     // Предупреждать об использовании console.log
      "prefer-promise-reject-errors": "error", // Ошибка, если Promise.reject без Error
      "no-async-promise-executor": "error"     // Запрещает async внутри new Promise
    }
  }
];
