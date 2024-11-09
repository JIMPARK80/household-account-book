module.exports = {
  env: {
    node: true, // Add this line to enable Node environment
    browser: true, // Also add browser if you’re running code in the browser
    es6: true
  },
  parser: "vue-eslint-parser", // Ensure Vue's parser is used
  parserOptions: {
    parser: "@babel/eslint-parser", // Use Babel parser for JS within Vue files
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: {
      jsx: false // Disable JSX parsing
    }
  },
  extends: [
    "plugin:vue/vue3-essential", // Use essential linting rules for Vue 3
    "eslint:recommended"
  ],
  rules: {
    // Add any custom rules here
  }
};
