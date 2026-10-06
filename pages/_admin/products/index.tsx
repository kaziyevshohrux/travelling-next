import React, { useState } from 'react';
import type { NextPage } from 'next';
import { MenuItem, Select, Stack, TablePagination, Typography } from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_PRODUCTS_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_PRODUCT_BY_ADMIN, UPDATE_PRODUCT_BY_ADMIN } from '../../../apollo/admin/mutation';
import { ProductPanelList } from '../../../libs/components/admin/products/ProductList';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import {
	ProductBookingType,
	ProductCategory,
	ProductRegion,
	ProductStatus,
	ProductType,
} from '../../../libs/enums/product.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../libs/sweetAlert';
import { AllProductsInquiry } from '../../../libs/types/product/product.input';
import { Product } from '../../../libs/types/product/product';
import { ProductUpdate } from '../../../libs/types/product/product.update';
import { humanizeProductValue } from '../../../libs/utils/product';

const AdminProducts: NextPage = ({ initialInquiry }: any) => {
	const [inquiry, setInquiry] = useState<AllProductsInquiry>(initialInquiry);
	const { data, refetch } = useQuery(GET_ALL_PRODUCTS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
	});
	const [updateProduct] = useMutation(UPDATE_PRODUCT_BY_ADMIN);
	const [removeProduct] = useMutation(REMOVE_PRODUCT_BY_ADMIN);
	const products: Product[] = data?.getAllProductsByAdmin?.list ?? [];
	const total = data?.getAllProductsByAdmin?.metaCounter?.[0]?.total ?? 0;

	const setSearch = (key: string, value?: unknown) => {
		const search = { ...inquiry.search, [key]: value };
		if (value === undefined || value === 'ALL') delete (search as any)[key];
		setInquiry({ ...inquiry, page: 1, search });
	};

	const updateProductHandler = async (input: ProductUpdate) => {
		try {
			await updateProduct({ variables: { input } });
			await refetch({ input: inquiry });
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const removeProductHandler = async (product: Product) => {
		if (product.productStatus !== ProductStatus.DELETE) return;
		try {
			if (!(await sweetConfirmAlert('Permanently remove this deleted listing?'))) return;
			await removeProduct({ variables: { productId: product._id } });
			await refetch({ input: inquiry });
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const filter = (label: string, key: string, values: string[], selected?: string) => (
		<Select size="small" displayEmpty value={selected ?? 'ALL'} onChange={(event) => setSearch(key, event.target.value)}>
			<MenuItem value="ALL">{label}: All</MenuItem>
			{values.map((value) => <MenuItem key={value} value={value}>{humanizeProductValue(value)}</MenuItem>)}
		</Select>
	);

	return (
		<div className="content">
			<Typography variant="h2" className="tit" sx={{ mb: 3 }}>Listings</Typography>
			<Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 3 }}>
				{filter('Status', 'productStatus', Object.values(ProductStatus), inquiry.search.productStatus)}
				{filter('Region', 'productRegionList', Object.values(ProductRegion), inquiry.search.productRegionList?.[0])}
				{filter('Type', 'productTypeList', Object.values(ProductType), inquiry.search.productTypeList?.[0])}
				{filter('Category', 'productCategoryList', Object.values(ProductCategory), inquiry.search.productCategoryList?.[0])}
				{filter('Booking', 'productBookingTypeList', Object.values(ProductBookingType), inquiry.search.productBookingTypeList?.[0])}
			</Stack>
			<ProductPanelList products={products} updateProductHandler={updateProductHandler} removeProductHandler={removeProductHandler} />
			<TablePagination
				rowsPerPageOptions={[10, 20, 40, 60]}
				component="div"
				count={total}
				rowsPerPage={inquiry.limit}
				page={inquiry.page - 1}
				onPageChange={(_event, page) => setInquiry({ ...inquiry, page: page + 1 })}
				onRowsPerPageChange={(event) => setInquiry({ ...inquiry, page: 1, limit: Number(event.target.value) })}
			/>
		</div>
	);
};

AdminProducts.defaultProps = {
	initialInquiry: { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: {} },
};

export default withAdminLayout(AdminProducts);