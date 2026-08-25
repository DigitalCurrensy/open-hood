import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/app/directory/**",
      "src/lib/directory/**",
      "src/app/auctions/**",
      "src/lib/auctions/**",
      "src/data/**",
      "src/app/guides/**",
      "src/lib/guides/**",
      "src/app/agent/**",
      "src/components/agent/**",
      "src/lib/agent/**",
      "src/app/jobs/**",
      "src/lib/jobs/**",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
