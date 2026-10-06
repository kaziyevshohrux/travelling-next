import React, { useState } from 'react';
import { Pagination, Stack, Typography } from '@mui/material';
import { useQuery } from '@apollo/client';
import { GET_VISITED } from '../../../apollo/user/query';
import ProductCard from '../product/ProductCard';
import { Product } from '../../types/product/product';

const RecentlyVisited = () => {
	const [inquiry, setInquiry] = useState({ page: 1, limit: 6 });
	const { data } = useQuery(GET_VISITED, { variables: { input: inquiry }, fetchPolicy: 'network-only' });
	const products: Product[] = data?.getVisited?.list ?? [];
	const total = data?.getVisited?.metaCounter?.[0]?.total ?? 0;

	return (
		<Stack id="recently-visited-page" spacing={3}>
			<Typography className="main-title">Recently visited listings</Typography>
			<Stack className="favorites-list-box">
				{products.length ? products.map((product) => <ProductCard key={product._id} product={product} recentlyVisited />) : <Typography>No recently visited listings found.</Typography>}
			</Stack>
			{products.length > 0 && <><Pagination count={Math.ceil(total / inquiry.limit) || 1} page={inquiry.page} onChange={(_event, page) => setInquiry({ ...inquiry, page })} /><Typography>{total} recently visited listing{total === 1 ? '' : 's'}</Typography></>}
		</Stack>
	);
};

export default RecentlyVisited;