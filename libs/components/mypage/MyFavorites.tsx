import React, { useState } from 'react';
import { Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { LIKE_TARGET_PRODUCT } from '../../../apollo/user/mutation';
import { GET_FAVORITES } from '../../../apollo/user/query';
import ProductCard from '../product/ProductCard';
import { Messages } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Product } from '../../types/product/product';

const MyFavorites = () => {
	const [inquiry, setInquiry] = useState({ page: 1, limit: 6 });
	const { data, refetch } = useQuery(GET_FAVORITES, { variables: { input: inquiry }, fetchPolicy: 'network-only' });
	const [likeProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const products: Product[] = data?.getFavorites?.list ?? [];
	const total = data?.getFavorites?.metaCounter?.[0]?.total ?? 0;

	const toggleFavorite = async (user: any, id: string) => {
		try {
			if (!user._id) throw new Error(Messages.error2);
			await likeProduct({ variables: { productId: id } });
			await refetch({ input: inquiry });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		}
	};

	return (
		<Stack id="my-favorites-page" spacing={3}>
			<Typography className="main-title">Favorite listings</Typography>
			<Stack className="favorites-list-box">
				{products.length ? products.map((product) => <ProductCard key={product._id} product={product} myFavorites likeProductHandler={toggleFavorite} />) : <Typography>No favorite listings found.</Typography>}
			</Stack>
			{products.length > 0 && <><Pagination count={Math.ceil(total / inquiry.limit) || 1} page={inquiry.page} onChange={(_event, page) => setInquiry({ ...inquiry, page })} /><Typography>{total} favorite listing{total === 1 ? '' : 's'}</Typography></>}
		</Stack>
	);
};

export default MyFavorites;