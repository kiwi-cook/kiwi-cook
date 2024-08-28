/*
 * Copyright (c) 2024 Josef Müller.
 */

// vue.config.js
const {defineConfig} = require('@vue/cli-service')

module.exports = defineConfig({
	publicPath: '/',
	configureWebpack: {
		entry: './src/app/main.ts',
	},
})
