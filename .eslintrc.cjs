module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	env: { node: true, es2022: true },
	overrides: [
		{
			files: ['scripts/**/*.ts', 'scripts/**/*.js'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/no-unused-vars': 'off',
				'no-useless-escape': 'off',
				'no-empty': 'off',
				'prefer-const': 'off'
			}
		}
	],
	ignorePatterns: ['dist/', 'node_modules/', '.turbo/'],
};


