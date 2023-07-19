module.exports = {
	root: true,
	env: {
		node: true
	},
	"plugins": ["sonarjs"],
	'extends': [
		'eslint:recommended',
		/* Vue */
		'plugin:vue/vue3-essential',
		'@vue/typescript/recommended',
		/* Detect bugs and suspicious patterns */
		"plugin:sonarjs/recommended"
	],
	parserOptions: {
		ecmaVersion: 2020
	},
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'vue/no-deprecated-slot-attribute': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'vue/multi-word-component-names': 'off',
		'vue/require-default-prop': 0,
		'vue/html-indent': ['error', 4],
		'vue/singleline-html-element-content-newline': 0,
		'vue/component-name-in-template-casing': ['error', 'PascalCase'],
		"vue/attributes-order": ["error", {
			"order": [
				"DEFINITION",
				"LIST_RENDERING",
				"CONDITIONALS",
				"RENDER_MODIFIERS",
				"GLOBAL",
				["UNIQUE", "SLOT"],
				"TWO_WAY_BINDING",
				"OTHER_DIRECTIVES",
				"OTHER_ATTR",
				"EVENTS",
				"CONTENT"
			],
			"alphabetical": false
		}]
	}
}
