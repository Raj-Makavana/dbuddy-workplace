import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "build/**",
            "next-env.d.ts",
            "coverage/**",
            "reports/**",
            "__tests__/**",
            "**/check-users-temp.js"
        ],
    },
    ...compat.extends("next/core-web-vitals"),
    {
        rules: {
            "no-unused-vars": ["warn", { "vars": "all", "args": "after-used", "ignoreRestSiblings": true }],
        },
    },
];

export default eslintConfig;