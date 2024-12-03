module.exports = {
  // Root configuration to prevent cascading from higher-level ESLint configs
  root: true,

  // Parser options for TypeScript and Vue files
  parserOptions: {
    parser: require.resolve('@typescript-eslint/parser'),
    extraFileExtensions: ['.vue'],
    ecmaVersion: 2021, // Use modern ECMAScript features
    sourceType: 'module', // Enable ES Modules
  },

  // Define environments for the code
  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  // Extend recommended rulesets for consistency and best practices
  extends: [
    'eslint:recommended', // Base ESLint rules
    'plugin:@typescript-eslint/recommended', // TypeScript-specific rules
    'plugin:vue/vue3-recommended', // Vue 3 recommended rules (Priority C)
    'airbnb-base', // Airbnb's base JavaScript style guide
    'plugin:prettier/recommended', // Prettier integration for consistent formatting
  ],

  // Plugins for additional linting capabilities
  plugins: ['@typescript-eslint', 'vue', 'prettier', 'import'],

  settings: {
    'import/resolver': {
      typescript: {
        // Use the paths defined in tsconfig.json
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      },
    },
  },

  // Define global variables to avoid false positives
  globals: {
    ga: 'readonly', // Google Analytics
    cordova: 'readonly',
    __statics: 'readonly',
    __QUASAR_SSR__: 'readonly',
    __QUASAR_SSR_SERVER__: 'readonly',
    __QUASAR_SSR_CLIENT__: 'readonly',
    __QUASAR_SSR_PWA__: 'readonly',
    process: 'readonly',
    Capacitor: 'readonly',
    chrome: 'readonly',
  },

  // Custom rules for project-specific needs
  rules: {
    // General JavaScript rules
    'no-console': 'warn', // Allow console logs but warn during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', // Allow debugger in development
    'no-plusplus': 'off', // Allow unary operators like ++ and --
    'no-param-reassign': ['error', { props: false }], // Allow parameter reassignment except for properties
    'no-nested-ternary': 'warn', // Discourage nested ternaries for readability
    'max-classes-per-file': 'off', // Allow multiple classes per file
    // 'max-len': ['error', { code: 200, ignoreComments: true }], // Enforce a maximum line length of 100 characters

    // Custom rules
    'max-len': 'off', // Allow longer lines
    'no-use-before-define': 'off', // Allow functions to be used before they are defined
    'no-restricted-globals': 'off', // Allow use of restricted globals
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],

    // TypeScript-specific rules
    '@typescript-eslint/no-shadow': 'error', // Prevent variable shadowing
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Ignore unused variables starting with "_"
    '@typescript-eslint/explicit-function-return-type': 'off', // Allow implicit return types
    '@typescript-eslint/no-var-requires': 'off', // Allow CommonJS `require`
    '@typescript-eslint/consistent-type-imports': 'error', // Enforce consistent usage of type imports

    // Vue-specific rules
    'vue/multi-word-component-names': 'off', // Allow single-word component names
    'vue/no-v-html': 'off', // Allow use of v-html (ensure proper sanitization)
    'vue/require-default-prop': 'off', // Allow props without default values
    'vue/attribute-hyphenation': ['error', 'always'], // Enforce hyphenated attribute names

    // Import/export rules
    'import/extensions': [
      'error',
      'ignorePackages',
      { js: 'never', ts: 'never', vue: 'always' },
    ], // Enforce consistent file extensions
    'import/no-unresolved': 'error', // Ensure imports resolve correctly
    'import/prefer-default-export': 'off', // Allow named exports
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
        'newlines-between': 'always',
      },
    ], // Enforce a consistent import order

    // Prettier rules
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        semi: false,
        trailingComma: 'es5',
        printWidth: 100,
        tabWidth: 2,
      },
    ], // Enforce Prettier formatting rules

    // Code style
    quotes: ['error', 'single', { avoidEscape: true }], // Enforce single quotes
    semi: ['error', 'never'], // Disallow semicolons
  },

  // Overrides for specific file types
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off', // Allow implicit return types for module boundaries
      },
    },
    {
      files: ['*.vue'],
      rules: {
        'max-len': ['error', { code: 120 }], // Allow longer lines in Vue files
      },
    },
  ],
};
