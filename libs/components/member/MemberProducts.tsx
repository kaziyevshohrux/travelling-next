import React, { useEffect, useState } from 'react';
import { Pagination, Stack, Typography } from '@mui/material';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_PRODUCTS } from '../../../apollo/user/query';
import { ProductCard } from '../mypage/ProductCard';
import { ProductsInquiry } from '../../types/product/product.input';
import { Product } from '../../types/product/product';

const MemberProducts = ({ initialInput }: any) => {
	const router = useRouter();
	const memberId = router.query.memberId as string | undefined;
	const [inquiry, setInquiry] = useState<ProductsInquiry>(initialInput);
	useEffect(() => {
		if (memberId) setInquiry((current) => ({ ...current, page: 1, search: { ...current.search, memberId } }));
	}, [memberId]);
	const { data } = useQuery(GET_PRODUCTS, { variables: { input: inquiry }, skip: !memberId, fetchPolicy: 'network-only' });
	const products: Product[] = data?.getProducts?.list ?? [];
	const total = data?.getProducts?.metaCounter?.[0]?.total ?? 0;

	return (
		<Stack id="member-products-page" spacing={3}>
			<Typography className="main-title">Listings</Typography>
			{products.length ? products.map((product) => <ProductCard key={product._id} product={product} memberPage />) : <Typography>No listings found.</Typography>}
			{products.length > 0 && <><Pagination count={Math.ceil(total / inquiry.limit) || 1} page={inquiry.page} onChange={(_event, page) => setInquiry({ ...inquiry, page })} /><Typography>{total} listing{total === 1 ? '' : 's'}</Typography></>}
		</Stack>
	);
};

MemberProducts.defaultProps = { initialInput: { page: 1, limit: 5, sort: 'createdAt', search: {} } };
export default MemberProducts;