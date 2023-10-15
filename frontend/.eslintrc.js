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
		}],
		"vue/order-in-components": ["error", {
			"order": ["el", "name", "parent", "functional", ["delimiters", "comments"], ["components", "directives", "filters"], "extends", "mixins", ["provide", "inject"], "ROUTER_GUARDS", "layout", ["props", "propsData"], "data", "computed", "watch", "LIFECYCLE_HOOKS", "methods", "head", ["template", "render"], "renderError"]
		}],
		"vue/this-in-template": ["error", "never"],
		"vue/no-v-html": "off",
		"vue/html-closing-bracket-newline": "off",
		"vue/max-attributes-per-line": ["error", {
			"singleline": 3,
			"multiline": {
				"max": 3,
				"allowFirstLine": false
			}
		}],
		"vue/html-self-closing": ["error", {
			"html": {
				"void": "always",
				"normal": "always",
				"component": "always"
			},
			"svg": "always",
			"math": "always"
		}],
		"vue/html-closing-bracket-spacing": ["error", {
			"startTag": "never",
			"endTag": "never",
			"selfClosingTag": "always"
		}],
		"vue/html-quotes": ["error", "double"],
		"vue/prop-name-casing": ["error", "camelCase"],
		"vue/require-prop-types": "error",
		"vue/v-bind-style": ["error", "shorthand"],
		"vue/v-on-style": ["error", "shorthand"],
		"vue/require-prop-type-constructor": "error",
		"vue/attribute-hyphenation": ["error", "always"],
		"vue/component-tags-order": ["error", {
			"order": ["template", "script", "style"]
		}],
		"vue/no-async-in-computed-properties": "error",
		"vue/no-dupe-keys": "error",
		"vue/no-duplicate-attributes": "error",
	}
}
