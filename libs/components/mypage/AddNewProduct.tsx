import React, { useEffect, useRef, useState } from 'react';
import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../../../apollo/user/mutation';
import { GET_PRODUCT } from '../../../apollo/user/query';
import { getJwtToken } from '../../auth';
import {
	ProductBookingType,
	ProductCategory,
	ProductPriceUnit,
	ProductRegion,
	ProductStatus,
	ProductType,
} from '../../enums/product.enum';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { ProductInput } from '../../types/product/product.input';
import { humanizeProductValue } from '../../utils/product';

const emptyProduct: ProductInput = {
	productType: ProductType.HOTEL,
	productCategory: ProductCategory.RELAXATION,
	productRegion: ProductRegion.SEOUL,
	productAddress: '',
	productTitle: '',
	productPrice: 0,
	productCurrency: 'KRW',
	productPriceUnit: ProductPriceUnit.PER_BOOKING,
	productBookingType: ProductBookingType.INSTANT,
	productImages: [],
	productDesc: '',
};

const AddProduct = ({ initialValues = emptyProduct }: { initialValues?: ProductInput }) => {
	const router = useRouter();
	const inputRef = useRef<HTMLInputElement>(null);
	const user = useReactiveVar(userVar);
	const legacyId = router.query.propertyId;
	const productId = (router.query.productId ?? legacyId) as string | undefined;
	const [form, setForm] = useState<ProductInput>(initialValues);
	const [status, setStatus] = useState<ProductStatus>(ProductStatus.ACTIVE);
	const [uploading, setUploading] = useState(false);
	const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT);
	const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT);
	const { data, loading } = useQuery(GET_PRODUCT, {
		fetchPolicy: 'network-only',
		variables: { productId },
		skip: !productId,
	});

	useEffect(() => {
		if (!data?.getProduct) return;
		const product = data.getProduct;
		setForm({
			productType: product.productType,
			productCategory: product.productCategory,
			productRegion: product.productRegion,
			productAddress: product.productAddress,
			productTitle: product.productTitle,
			productPrice: product.productPrice,
			productCurrency: product.productCurrency,
			productPriceUnit: product.productPriceUnit,
			productBookingType: product.productBookingType,
			productImages: product.productImages,
			productDesc: product.productDesc ?? '',
		});
		setStatus(product.productStatus);
	}, [data]);

	useEffect(() => {
		if (router.isReady && user.memberType !== 'AGENT') router.replace('/');
	}, [router.isReady, user.memberType]);

	const setField = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) =>
		setForm((current) => ({ ...current, [key]: value }));

	const uploadImages = async () => {
		const files = Array.from(inputRef.current?.files ?? []);
		if (!files.length) return;
		if (files.length > 5) {
			await sweetMixinErrorAlert('You can upload up to five images.');
			return;
		}
		setUploading(true);
		try {
			const operations = {
				query: 'mutation ImagesUploader($files: [Upload!]!, $target: String!) { imagesUploader(files: $files, target: $target) }',
				variables: { files: files.map(() => null), target: 'product' },
			};
			const map = Object.fromEntries(files.map((_, index) => [String(index), [`variables.files.${index}`]]));
			const body = new FormData();
			body.append('operations', JSON.stringify(operations));
			body.append('map', JSON.stringify(map));
			files.forEach((file, index) => body.append(String(index), file));
			const response = await axios.post(process.env.REACT_APP_API_GRAPHQL_URL as string, body, {
				headers: {
					'apollo-require-preflight': 'true',
					Authorization: `Bearer ${getJwtToken()}`,
				},
			});
			setField('productImages', response.data.data.imagesUploader);
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		} finally {
			setUploading(false);
		}
	};

	const valid =
		form.productTitle.trim().length >= 3 &&
		form.productAddress.trim().length >= 3 &&
		form.productPrice >= 0 &&
		form.productImages.length > 0 &&
		(!form.productDesc || form.productDesc.trim().length >= 5);

	const submit = async () => {
		try {
			if (productId) {
				await updateProduct({ variables: { input: { _id: productId, ...form, productStatus: status } } });
			} else {
				await createProduct({ variables: { input: form } });
			}
			await sweetMixinSuccessAlert(productId ? 'Listing updated successfully.' : 'Listing created successfully.');
			await router.push('/mypage?category=myProducts');
		} catch (error) {
			await sweetErrorHandling(error);
		}
	};

	const selectField = (label: string, key: keyof ProductInput, values: string[]) => (
		<TextField select fullWidth label={label} value={form[key] as string} onChange={(event) => setField(key, event.target.value as any)}>
			{values.map((value) => <MenuItem key={value} value={value}>{humanizeProductValue(value)}</MenuItem>)}
		</TextField>
	);

	if (loading) return <Typography>Loading listing…</Typography>;

	return (
		<div id="add-product-page">
			<Stack className="main-title-box">
				<Typography className="main-title">{productId ? 'Edit listing' : 'Add a new listing'}</Typography>
				<Typography className="sub-title">Share a stay, tour, activity, ride, or restaurant.</Typography>
			</Stack>
			<Stack spacing={2} className="config">
				<TextField label="Listing title" value={form.productTitle} onChange={(event) => setField('productTitle', event.target.value)} inputProps={{ minLength: 3, maxLength: 100 }} />
				<TextField label="Address" value={form.productAddress} onChange={(event) => setField('productAddress', event.target.value)} inputProps={{ minLength: 3, maxLength: 100 }} />
				<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
					{selectField('Type', 'productType', Object.values(ProductType))}
					{selectField('Category', 'productCategory', Object.values(ProductCategory))}
					{selectField('Region', 'productRegion', Object.values(ProductRegion))}
				</Stack>
				<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
					{selectField('Booking type', 'productBookingType', Object.values(ProductBookingType))}
					{selectField('Price unit', 'productPriceUnit', Object.values(ProductPriceUnit))}
					<TextField label="Currency" value={form.productCurrency ?? 'KRW'} onChange={(event) => setField('productCurrency', event.target.value.toUpperCase())} inputProps={{ maxLength: 3 }} />
					<TextField type="number" label="Price" value={form.productPrice} inputProps={{ min: 0, step: '0.01' }} onChange={(event) => setField('productPrice', Math.max(0, Number(event.target.value)))} />
				</Stack>
				{productId && (
					<TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value as ProductStatus)}>
						{[ProductStatus.ACTIVE, ProductStatus.INACTIVE, ProductStatus.SOLD_OUT].map((value) => <MenuItem key={value} value={value}>{humanizeProductValue(value)}</MenuItem>)}
					</TextField>
				)}
				<TextField multiline minRows={4} label="Description" value={form.productDesc ?? ''} onChange={(event) => setField('productDesc', event.target.value)} inputProps={{ maxLength: 500 }} />
				<input ref={inputRef} type="file" accept="image/png,image/jpeg" multiple onChange={uploadImages} />
				<Typography>{uploading ? 'Uploading…' : `${form.productImages.length} image(s) ready`}</Typography>
				<Stack direction="row" spacing={1}>
					{form.productImages.map((image) => <img key={image} src={`${process.env.REACT_APP_API_URL}/${image}`} alt="" width={96} height={72} style={{ objectFit: 'cover' }} />)}
				</Stack>
				<Button variant="contained" disabled={!valid || creating || updating || uploading} onClick={submit}>
					{productId ? 'Save listing' : 'Publish listing'}
				</Button>
			</Stack>
		</div>
	);
};

export default AddProduct;