module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 11
  },
  rules: {
    'space-before-function-paren': [
      'error',
      {
        asyncArrow: 'never',
        named: 'never',
        anonymous: 'always'
      }
    ]
  }
}
