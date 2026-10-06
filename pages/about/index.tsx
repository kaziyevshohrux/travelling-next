import React from 'react';
import { Stack, Typography } from '@mui/material';
import { NextPage } from 'next';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';

const About: NextPage = () => (
	<Stack id="about-page" spacing={5}>
		<div className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
			<Typography variant="h2" gutterBottom>Travel deeper with Travelling</Typography>
			<Typography variant="h6" maxWidth={760}>
				Travelling connects people exploring South Korea with providers offering memorable stays, tours,
				activities, transport, and restaurants.
			</Typography>
	</div>
	<Stack className="container" direction={{ xs: 'column', md: 'row' }} spacing={4}>
		<div style={{ flex: 1 }}><Typography variant="h4">Discover with confidence</Typography><Typography>Compare clear listing details, booking methods, prices, reviews, and provider profiles before planning your journey.</Typography></div>
		<div style={{ flex: 1 }}><Typography variant="h4">Built for local providers</Typography><Typography>Providers can publish and manage travel listings while keeping availability and booking status current.</Typography></div>
		<div style={{ flex: 1 }}><Typography variant="h4">Explore together</Typography><Typography>Save favorites, revisit discoveries, and exchange practical advice with the Travelling community.</Typography></div>
	</Stack>
	<div className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
		<img src="/img/banner/cities/JEJU.webp" alt="Jeju landscape" style={{ width: '100%', maxHeight: 480, objectFit: 'cover', borderRadius: 16 }} />
	</div>
	</Stack>
);

export default withLayoutBasic(About);
