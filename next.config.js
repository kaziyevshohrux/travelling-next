/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	env: {
		REACT_APP_API_URL: process.env.REACT_APP_API_URL,
		REACT_APP_API_GRAPHQL_URL: process.env.REACT_APP_API_GRAPHQL_URL,
		REACT_APP_CHAT_WS_URL: process.env.REACT_APP_CHAT_WS_URL,
	},
	async redirects() {
		return [
			{ source: '/property/:path*', destination: '/products/:path*', permanent: true },
			{ source: '/agent/:path*', destination: '/providers/:path*', permanent: true },
			{ source: '/_admin/properties/:path*', destination: '/_admin/products/:path*', permanent: true },
		];
	},
};
const { i18n } = require('./next-i18next.config');
nextConfig.i18n = i18n;
module.exports = nextConfig;