/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  "src/**/*.ts": ["eslint", "prettier --check ."],
  "*.{json,md,yml,yaml}": "prettier --check .",
};
