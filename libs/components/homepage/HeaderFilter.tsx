import React, { useState } from 'react';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { ProductCategory, ProductRegion, ProductType } from '../../enums/product.enum';
import { ProductsInquiry } from '../../types/product/product.input';
import { humanizeProductValue } from '../../utils/product';

interface HeaderFilterProps {
	initialInput: ProductsInquiry;
}

const HeaderFilter = ({ initialInput }: HeaderFilterProps) => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const [input, setInput] = useState<ProductsInquiry>(initialInput);

	const updateList = (key: string, value: string) => {
		const search = { ...input.search, [key]: value ? [value] : undefined };
		setInput({ ...input, page: 1, search });
	};

	return (
		<Stack className="search-box" direction={{ xs: 'column', md: 'row' }} spacing={1}>
			<TextField
				label={t('Search listings')}
				value={input.search.text ?? ''}
				onChange={(event) => setInput({ ...input, search: { ...input.search, text: event.target.value || undefined } })}
			/>
			<TextField select label={t('Region')} value={input.search.regionList?.[0] ?? ''} onChange={(e) => updateList('regionList', e.target.value)}>
				<MenuItem value="">{t('All')}</MenuItem>
				{Object.values(ProductRegion).map((value) => <MenuItem key={value} value={value}>{humanizeProductValue(value)}</MenuItem>)}
			</TextField>
			<TextField select label={t('Listing type')} value={input.search.typeList?.[0] ?? ''} onChange={(e) => updateList('typeList', e.target.value)}>
				<MenuItem value="">{t('All')}</MenuItem>
				{Object.values(ProductType).map((value) => <MenuItem key={value} value={value}>{humanizeProductValue(value)}</MenuItem>)}
			</TextField>
			<TextField select label={t('Category')} value={input.search.categoryList?.[0] ?? ''} onChange={(e) => updateList('categoryList', e.target.value)}>
				<MenuItem value="">{t('All')}</MenuItem>
				{Object.values(ProductCategory).map((value) => <MenuItem key={value} value={value}>{humanizeProductValue(value)}</MenuItem>)}
			</TextField>
			<Button variant="contained" onClick={() => router.push({ pathname: '/products', query: { input: JSON.stringify(input) } })}>
				{t('Search')}
			</Button>
		</Stack>
	);
};

HeaderFilter.defaultProps = {
	initialInput: { page: 1, limit: 9, search: {} },
};

export default HeaderFilter;