/** @type {import('eslint').Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: { project: './tsconfig.app.json' },

  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],

  plugins: ['@typescript-eslint', 'jest'],

  env: { browser: true, node: true, 'jest/globals': true },

  settings: {
    'import/resolver': {
      typescript: {},
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },

  rules: {
    /* general tweaks */
    'no-console': 'off',
    'linebreak-style': 'off',
    'func-names': 'off',

    /* TypeScript-specific */
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    /* import rules */
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['{features,scripts,test}/**/*.ts', '*.ts'] },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        pathGroups: [{ pattern: '@cumulusds/**', group: 'internal' }],
        pathGroupsExcludedImportTypes: ['internal'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      },
    ],

    /* Jest */
    'jest/prefer-expect-assertions': 'error',
  },
};
