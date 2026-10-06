import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Pagination, Stack, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_AGENT_PRODUCTS } from '../../../apollo/user/query';
import { UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { ProductCard } from './ProductCard';
import { ProductStatus } from '../../enums/product.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../sweetAlert';
import { AgentProductsInquiry } from '../../types/product/product.input';
import { Product } from '../../types/product/product';
import { humanizeProductValue } from '../../utils/product';

const MyProducts: NextPage = ({ initialInput }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [inquiry, setInquiry] = useState<AgentProductsInquiry>(initialInput);
	const { data, refetch } = useQuery(GET_AGENT_PRODUCTS, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
	});
	const [updateProduct] = useMutation(UPDATE_PRODUCT);
	const products: Product[] = data?.getAgentProducts?.list ?? [];
	const total = data?.getAgentProducts?.metaCounter?.[0]?.total ?? 0;

	useEffect(() => {
		if (router.isReady && user.memberType !== 'AGENT') router.replace('/');
	}, [router.isReady, user.memberType]);

	const changeStatusFilter = (productStatus: ProductStatus) => setInquiry({ ...inquiry, page: 1, search: { productStatus } });

	const updateStatus = async (productStatus: ProductStatus, id: string) => {
		try {
			if (!(await sweetConfirmAlert(`Change this listing to ${humanizeProductValue(productStatus)}?`))) return;
			await updateProduct({ variables: { input: { _id: id, productStatus } } });
			await refetch({ input: inquiry });
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const deleteProduct = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Delete this listing? This status is terminal.'))) return;
			await updateProduct({ variables: { input: { _id: id, productStatus: ProductStatus.DELETE } } });
			await refetch({ input: inquiry });
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	return (
		<div id="my-product-page">
			<Stack className="main-title-box">
				<Typography className="main-title">My listings</Typography>
				<Typography className="sub-title">Manage availability and booking status.</Typography>
			</Stack>
			<Stack className="product-list-box">
				<Stack className="tab-name-box" direction="row" spacing={2}>
					{[ProductStatus.ACTIVE, ProductStatus.INACTIVE, ProductStatus.SOLD_OUT, ProductStatus.DELETE].map((status) => (
						<Typography
							key={status}
							onClick={() => changeStatusFilter(status)}
							className={inquiry.search.productStatus === status ? 'active-tab-name' : 'tab-name'}
						>{humanizeProductValue(status)}</Typography>
					))}
				</Stack>
				<Stack className="list-box">
					{products.length === 0 ? <Typography className="no-data">No listings found.</Typography> : products.map((product) => (
						<ProductCard key={product._id} product={product} deleteProductHandler={deleteProduct} updateProductHandler={updateStatus} />
					))}
					{products.length > 0 && (
						<Stack className="pagination-config">
							<Pagination count={Math.ceil(total / inquiry.limit) || 1} page={inquiry.page} onChange={(_event, page) => setInquiry({ ...inquiry, page })} />
							<Typography>{total} listings</Typography>
						</Stack>
					)}
				</Stack>
			</Stack>
		</div>
	);
};

MyProducts.defaultProps = {
	initialInput: { page: 1, limit: 5, sort: 'createdAt', search: { productStatus: ProductStatus.ACTIVE } },
};

export default MyProducts;