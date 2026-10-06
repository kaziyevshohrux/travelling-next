import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/svg+xml" href="/img/logo/favicon.svg" />
				<meta name="keywords" content="Travelling, South Korea travel, hotels, tours, activities, transport, restaurants" />
				<meta name="description" content="Discover and book memorable stays, tours, activities, transport, and restaurants across South Korea with Travelling." />
				<meta property="og:site_name" content="Travelling" />
				<meta property="og:title" content="Travelling — Explore South Korea" />
				<meta property="og:description" content="Find travel listings from trusted providers across South Korea." />
			</Head>
			<body><Main /><NextScript /></body>
		</Html>
	);
}