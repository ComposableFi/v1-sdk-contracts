module.exports = {
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		sourceType: "module",
	},
	plugins: ["@typescript-eslint/eslint-plugin", "truffle"],
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
	root: true,
	env: {
		node: true,
		browser: true,
		commonjs: true,
		es2021: true,
		mocha: true, // for test files
		"truffle/globals": true,
	},
};
