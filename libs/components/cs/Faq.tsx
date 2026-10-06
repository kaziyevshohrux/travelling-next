import React, { useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Stack, Tab, Tabs, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqGroups = {
	travellers: [
		['What can I book on Travelling?', 'Travelling includes hotels, tours, activities, transport, and restaurants across South Korea.'],
		['How do I find the right listing?', 'Filter listings by region, type, category, booking method, price, or search text.'],
		['What is an instant booking?', 'Instant listings can be booked immediately. Request listings require confirmation from the provider.'],
		['How do favorites work?', 'Sign in and select the heart on a listing to save or remove it from your favorites.'],
	],
	providers: [
		['How do I become a provider?', 'Register with the Provider role. Provider accounts can create and manage travel listings.'],
		['Which images can I upload?', 'Upload up to five JPEG or PNG images for each listing.'],
		['Which listing statuses are available?', 'Listings can be active, inactive, or sold out. Deletion is terminal.'],
		['How are providers ranked?', 'Provider ranking uses the activity and engagement signals maintained by the Travelling backend.'],
	],
	account: [
		['How do I update my profile?', 'Open My Page and use the profile section to update your public information and image.'],
		['Where can I see recent listings?', 'My Page includes favorites and recently visited listings.'],
		['How do reviews work?', 'Authenticated members can review listings and provider profiles.'],
	],
};

const Faq = () => {
	const [group, setGroup] = useState<keyof typeof faqGroups>('travellers');
	return (
		<Stack spacing={3}>
			<Tabs value={group} onChange={(_event, value) => setGroup(value)}>
				<Tab value="travellers" label="For travellers" />
				<Tab value="providers" label="For providers" />
				<Tab value="account" label="Accounts" />
			</Tabs>
			{faqGroups[group].map(([question, answer]) => (
				<Accordion key={question}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography fontWeight={600}>{question}</Typography></AccordionSummary>
					<AccordionDetails><Typography>{answer}</Typography></AccordionDetails>
				</Accordion>
			))}
		</Stack>
	);
};

export default Faq;