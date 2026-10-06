import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ModeIcon from '@mui/icons-material/Mode';
import { useRouter } from 'next/router';
import { ProductStatus } from '../../enums/product.enum';
import { Product } from '../../types/product/product';
import { formatProductPrice, humanizeProductValue } from '../../utils/product';

interface ProductCardProps {
	product: Product;
	deleteProductHandler?: (id: string) => void;
	memberPage?: boolean;
	updateProductHandler?: (status: ProductStatus, id: string) => void;
}

export const ProductCard = ({ product, deleteProductHandler, memberPage, updateProductHandler }: ProductCardProps) => {
	const router = useRouter();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const canManage = !memberPage && product.productStatus !== ProductStatus.DELETE;

	return (
		<Stack className="product-card-box" direction={{ xs: 'column', md: 'row' }} spacing={2}>
			<img
				className="image-box"
				src={product.productImages[0] ? `${process.env.REACT_APP_API_URL}/${product.productImages[0]}` : '/img/banner/cities/SEOUL.webp'}
				alt={product.productTitle}
				onClick={() => !memberPage && router.push(`/products/detail?id=${product._id}`)}
			/>
			<Stack className="information-box">
				<Typography className="name">{product.productTitle}</Typography>
				<Typography>{product.productAddress} · {humanizeProductValue(product.productRegion)}</Typography>
				<Typography className="price"><strong>{formatProductPrice(product, router.locale)}</strong></Typography>
			</Stack>
			<Typography>{new Date(product.createdAt).toLocaleDateString(router.locale)}</Typography>
			{canManage ? (
				<>
					<Typography className="status" onClick={(event) => setAnchor(event.currentTarget)}>{humanizeProductValue(product.productStatus)}</Typography>
					<Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
						{[ProductStatus.ACTIVE, ProductStatus.INACTIVE, ProductStatus.SOLD_OUT].filter((status) => status !== product.productStatus).map((status) => (
							<MenuItem key={status} onClick={() => { setAnchor(null); updateProductHandler?.(status, product._id); }}>{humanizeProductValue(status)}</MenuItem>
						))}
					</Menu>
				</>
			) : <Typography>{humanizeProductValue(product.productStatus)}</Typography>}
			<Typography>{product.productViews} views</Typography>
			{canManage && (
				<Stack direction="row">
					<IconButton onClick={() => router.push({ pathname: '/mypage', query: { category: 'addProduct', productId: product._id } })}><ModeIcon /></IconButton>
					<IconButton onClick={() => deleteProductHandler?.(product._id)}><DeleteIcon /></IconButton>
				</Stack>
			)}
		</Stack>
	);
};