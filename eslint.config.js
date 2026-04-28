import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,     // Глобальные переменные браузера (window, fetch)
        ...globals.node         // Глобальные переменные Node.js (process)
      }
    },
    rules: {
      "no-console": "warn",     // Предупреждать об использовании console.log
      "prefer-promise-reject-errors": "error", // Ошибка, если Promise.reject без Error
      "no-async-promise-executor": "error"     // Запрещает async внутри new Promise
    }
  }
];
