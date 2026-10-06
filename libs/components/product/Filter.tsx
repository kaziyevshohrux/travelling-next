import React, { useState } from 'react';
import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import {
	ProductBookingType,
	ProductCategory,
	ProductRegion,
	ProductType,
} from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { humanizeProductValue } from '../../utils/product';

interface FilterProps {
	searchFilter: ProductsInquiry;
	setSearchFilter: (input: ProductsInquiry) => void;
	initialInput: ProductsInquiry;
}

const Filter = ({ searchFilter, setSearchFilter, initialInput }: FilterProps) => {
	const router = useRouter();
	const [text, setText] = useState(searchFilter.search.text ?? '');

	const updateSearch = (key: string, value?: unknown) => {
		const search = { ...searchFilter.search, [key]: value };
		if (value === undefined || value === '') delete (search as any)[key];
		setSearchFilter({ ...searchFilter, page: 1, search });
	};

	const pushFilters = () => {
		const input = { ...searchFilter, page: 1, search: { ...searchFilter.search, text: text || undefined } };
		setSearchFilter(input);
		router.push({ pathname: '/products', query: { input: JSON.stringify(input) } }, undefined, { scroll: false });
	};

	const singleSelect = (label: string, key: string, values: string[], current?: string[]) => (
		<TextField
			select
			fullWidth
			label={label}
			value={current?.[0] ?? ''}
			onChange={(event) => updateSearch(key, event.target.value ? [event.target.value] : undefined)}
		>
			<MenuItem value="">All</MenuItem>
			{values.map((value) => <MenuItem key={value} value={value}>{humanizeProductValue(value)}</MenuItem>)}
		</TextField>
	);

	return (
		<Stack className="filter-config" spacing={2}>
			<Typography className="title">Find your next trip</Typography>
			<TextField label="Search listings" value={text} onChange={(event) => setText(event.target.value)} />
			{singleSelect('Region', 'regionList', Object.values(ProductRegion), searchFilter.search.regionList)}
			{singleSelect('Listing type', 'typeList', Object.values(ProductType), searchFilter.search.typeList)}
			{singleSelect('Category', 'categoryList', Object.values(ProductCategory), searchFilter.search.categoryList)}
			{singleSelect('Booking type', 'bookingTypeList', Object.values(ProductBookingType), searchFilter.search.bookingTypeList)}
			<Stack direction="row" spacing={1}>
				<TextField
					type="number"
					label="Minimum price"
					inputProps={{ min: 0 }}
					value={searchFilter.search.pricesRange?.start ?? ''}
					onChange={(event) => updateSearch('pricesRange', {
						start: Math.max(0, Number(event.target.value)),
						end: searchFilter.search.pricesRange?.end ?? 10000000,
					})}
				/>
				<TextField
					type="number"
					label="Maximum price"
					inputProps={{ min: 0 }}
					value={searchFilter.search.pricesRange?.end ?? ''}
					onChange={(event) => updateSearch('pricesRange', {
						start: searchFilter.search.pricesRange?.start ?? 0,
						end: Math.max(0, Number(event.target.value)),
					})}
				/>
			</Stack>
			<Button variant="contained" onClick={pushFilters}>Search</Button>
			<Button onClick={() => { setText(''); setSearchFilter(initialInput); }}>Reset filters</Button>
		</Stack>
	);
};

export default Filter;