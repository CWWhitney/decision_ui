import eslint from "@eslint/js";
import tsEslint from "typescript-eslint";

export default tsEslint.config({
    files: ["src/**/*.{js,ts,mts,tsx,vue}"],
    ignores: ["node_modules", "src/**/*.ohm-bundle.js", "src/**/*.ohm-bundle.d.ts"],
    extends: [eslint.configs.recommended, tsEslint.configs.recommended],
    rules: {
        semi: [2, "always"],
        "max-len": ["error", { code: 120 }],
        "@typescript-eslint/no-explicit-any": [0],
        "@typescript-eslint/explicit-module-boundary-types": [0],
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_"
            }
        ]
    }
});
