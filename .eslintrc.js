// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 100,
        tabWidth: 2,
        singleQuote: true,
        bracketSameLine: true,
        arrowParens: 'always',
        jsxSingleQuote: true,
        quoteProps: 'as-needed',
        trailingComma: 'es5',
        semi: false,
      },
    ],
  },
}
