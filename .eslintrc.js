module.exports = {
	root: true,

	env: {
		node: true,
		es6: true
	},

	extends: ["plugin:vue/essential", "eslint:recommended", "@vue/prettier"],

	parserOptions: {
		parser: 'babel-eslint'
	},

	rules: {
		'no-unused-vars': [
			'warn',
			{
				allow: ['warn', 'error']
			}
		],
		'nuxt/no-cjs-in-config': 'off',
		'no-empty': ['error', { allowEmptyCatch: true }],
		'no-console': [
			'warn',
			{
				allow: ['warn', 'error']
			}
		],
		'max-lines': [
			'warn',
			{
				skipBlankLines: true,
				skipComments: true
			}
		],
		semi: ['error', 'never'],
		'comma-dangle': ['error', 'never'],
		'import/no-unresolved': 'off',
		'import/prefer-default-export': 'off',
		'no-shadow': ['error', { allow: ['state'] }],
		'no-param-reassign': ['error', { props: false }],
		'linebreak-style': 0,
		'prettier/prettier': [
			'warn',
			{
				singleQuote: true,
				semi: false,
				trailingComma: 'none',
				printWidth: 120,
				tabWidth: 4,
				arrowParens: 'always',
				useTabs: true
			}
		],
		'arrow-parens': 0
	},

	'extends': [
		'plugin:vue/strongly-recommended',
		'eslint:recommended',
		'@vue/prettier'
	]
};
