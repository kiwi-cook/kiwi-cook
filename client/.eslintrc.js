module.exports = {
	root: true,
	env: {
		node: true
	},
	'plugins': ['sonarjs'],
	'extends': [
		'eslint:recommended',
		/* Vue */
		'plugin:vue/vue3-essential',
		'@vue/typescript/recommended',
		/* Detect bugs and suspicious patterns */
		'plugin:sonarjs/recommended'
	],
	parserOptions: {
		ecmaVersion: 2020
	},
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'quotes': [2, 'single', {'avoidEscape': true}],
		'vue/attribute-hyphenation': ['error', 'always'],
		'vue/attributes-order': ['error', {
			'order': [
				'DEFINITION',
				'LIST_RENDERING',
				'CONDITIONALS',
				'RENDER_MODIFIERS',
				'GLOBAL',
				['UNIQUE', 'SLOT'],
				'TWO_WAY_BINDING',
				'OTHER_DIRECTIVES',
				'OTHER_ATTR',
				'EVENTS',
				'CONTENT'
			],
			'alphabetical': false
		}],
		'vue/component-name-in-template-casing': ['error', 'PascalCase'],
		'vue/component-tags-order': ['error', {
			'order': ['template', 'script', 'style']
		}],
		'vue/html-closing-bracket-newline': 'off',
		'vue/html-indent': ['error', 4],
		'vue/html-quotes': ['error', 'double'],
		'vue/html-self-closing': ['error', {
			'html': {
				'void': 'always',
				'normal': 'always',
				'component': 'always'
			},
			'svg': 'always',
			'math': 'always'
		}],
		'vue/multi-word-component-names': 'off',
		'vue/no-async-in-computed-properties': 'error',
		'vue/no-deprecated-slot-attribute': 'off',
		'vue/no-dupe-keys': 'error',
		'vue/no-duplicate-attributes': 'error',
		'vue/no-v-html': 'off',
		'vue/order-in-components': ['error', {
			'order': ['el', 'name', 'parent', 'functional', ['delimiters', 'comments'], ['components', 'directives', 'filters'], 'extends', 'mixins', ['provide', 'inject'], 'ROUTER_GUARDS', 'layout', ['props', 'propsData'], 'data', 'computed', 'watch', 'LIFECYCLE_HOOKS', 'methods', 'head', ['template', 'render'], 'renderError']
		}],
		'vue/prop-name-casing': ['error', 'camelCase'],
		'vue/require-default-prop': 0,
		'vue/require-prop-type-constructor': 'error',
		'vue/require-prop-types': 'error',
		'vue/singleline-html-element-content-newline': 0,
		'vue/this-in-template': ['error', 'never'],
		'vue/v-bind-style': ['error', 'shorthand'],
		'vue/v-on-style': ['error', 'shorthand']
	}
}
