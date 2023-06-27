module.exports = {
	root: true,
	env: {
		node: true
	},
	'extends': [
		'plugin:vue/vue3-essential',
		'eslint:recommended',
		'@vue/typescript/recommended'
	],
	parserOptions: {
		ecmaVersion: 2020
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'vue/no-deprecated-slot-attribute': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'vue/multi-word-component-names': 'off',
		'vue/require-default-prop': 0,
		'vue/html-indent': ['error', 4],
		'vue/singleline-html-element-content-newline': 0,
		'vue/component-name-in-template-casing': ['error', 'PascalCase'],
	}
}
