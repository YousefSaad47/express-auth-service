// @ts-check

/** @type {import("prettier").Config} */
const config = {
  arrowParens: "always",
  bracketSpacing: true,
  singleQuote: false,
  useTabs: false,
  tabWidth: 2,
  printWidth: 80,
  trailingComma: "es5",
  endOfLine: "lf",
  quoteProps: "consistent",

  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "",
    "<BUILTIN_MODULES>",
    "",
    "^express$",
    "",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/",
    "",
    "^[.]",
    "",
    "<TYPES>",
  ],
  importOrderParserPlugins: ["typescript", "jsx"],
  importOrderTypeScriptVersion: "5.0.0",
  importOrderCaseSensitive: false,
};

export default config;
