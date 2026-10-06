import React, { useEffect, useMemo, useState } from 'react';
import { Button, MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { GET_PRODUCTS } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import Filter from '../../libs/components/product/Filter';
import ProductCard from '../../libs/components/product/ProductCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Direction, Message } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { ProductsInquiry } from '../../libs/types/product/product.input';
import { Product } from '../../libs/types/product/product';

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const ProductList: NextPage = ({ initialInput }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const urlInput = useMemo(() => {
		if (!router.query.input) return null;
		try { return JSON.parse(router.query.input as string) as ProductsInquiry; } catch { return null; }
	}, [router.query.input]);
	const [inquiry, setInquiry] = useState<ProductsInquiry>(urlInput ?? initialInput);
	const { data, refetch } = useQuery(GET_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
	});
	const [likeProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const products: Product[] = data?.getProducts?.list ?? [];
	const total = data?.getProducts?.metaCounter?.[0]?.total ?? 0;

	useEffect(() => {
		if (urlInput) setInquiry(urlInput);
	}, [urlInput]);

	const applyInquiry = async (next: ProductsInquiry) => {
		setInquiry(next);
		await router.push({ pathname: '/products', query: { input: JSON.stringify(next) } }, undefined, { scroll: false });
	};

	const likeProductHandler = async (_currentUser: unknown, id: string) => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeProduct({ variables: { productId: id } });
			await refetch({ input: inquiry });
			await sweetTopSmallSuccessAlert('Saved.', 800);
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		}
	};

	return (
		<div id="product-list-page">
			<div className="container">
				<Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
					<TextField
						select
						size="small"
						label="Sort by"
						value={`${inquiry.sort ?? 'createdAt'}:${inquiry.direction ?? Direction.DESC}`}
						onChange={(event) => {
							const [sort, direction] = event.target.value.split(':');
							applyInquiry({ ...inquiry, page: 1, sort, direction: direction as Direction });
						}}
					>
						<MenuItem value={`createdAt:${Direction.DESC}`}>Newest</MenuItem>
						<MenuItem value={`productPrice:${Direction.ASC}`}>Lowest price</MenuItem>
						<MenuItem value={`productPrice:${Direction.DESC}`}>Highest price</MenuItem>
						<MenuItem value={`productRank:${Direction.DESC}`}>Top ranked</MenuItem>
					</TextField>
				</Stack>
				<Stack className="product-page" direction={{ xs: 'column', md: 'row' }} spacing={3}>
					<Filter searchFilter={inquiry} setSearchFilter={applyInquiry} initialInput={initialInput} />
					<Stack className="main-config" flex={1}>
						<Stack className="list-config">
							{products.length === 0
								? <Typography className="no-data">No listings found.</Typography>
								: products.map((product) => <ProductCard key={product._id} product={product} likeProductHandler={likeProductHandler} />)}
						</Stack>
						{products.length > 0 && (
							<Stack className="pagination-config" alignItems="center">
								<Pagination page={inquiry.page} count={Math.ceil(total / inquiry.limit) || 1} onChange={(_event, page) => applyInquiry({ ...inquiry, page })} />
								<Typography>{total} listing{total === 1 ? '' : 's'} available</Typography>
							</Stack>
						)}
					</Stack>
				</Stack>
			</div>
		</div>
	);
};

ProductList.defaultProps = {
	initialInput: { page: 1, limit: 9, sort: 'createdAt', direction: Direction.DESC, search: {} },
};

export default withLayoutBasic(ProductList);