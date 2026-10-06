import React, { useState } from 'react';
import Link from 'next/link';
import {
	Avatar,
	Button,
	Menu,
	MenuItem,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { REACT_APP_API_URL } from '../../../config';
import { ProductStatus } from '../../../enums/product.enum';
import { Product } from '../../../types/product/product';
import { ProductUpdate } from '../../../types/product/product.update';
import { formatProductPrice, humanizeProductValue } from '../../../utils/product';

interface ProductPanelListProps {
	products: Product[];
	updateProductHandler: (input: ProductUpdate) => Promise<void>;
	removeProductHandler: (product: Product) => Promise<void>;
}

export const ProductPanelList = ({ products, updateProductHandler, removeProductHandler }: ProductPanelListProps) => {
	const [menu, setMenu] = useState<{ anchor: HTMLElement; product: Product } | null>(null);

	return (
		<TableContainer>
			<Table sx={{ minWidth: 850 }}>
				<TableHead>
					<TableRow>
						<TableCell>Listing</TableCell>
						<TableCell>Price</TableCell>
						<TableCell>Provider</TableCell>
						<TableCell>Region</TableCell>
						<TableCell>Type / Category</TableCell>
						<TableCell>Status</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{products.length === 0 && <TableRow><TableCell colSpan={6} align="center">No listings found.</TableCell></TableRow>}
					{products.map((product) => (
						<TableRow key={product._id} hover>
							<TableCell>
								<Stack direction="row" spacing={1} alignItems="center">
									<Avatar src={product.productImages[0] ? `${REACT_APP_API_URL}/${product.productImages[0]}` : undefined} />
									{product.productStatus === ProductStatus.ACTIVE
										? <Link href={`/products/detail?id=${product._id}`}>{product.productTitle}</Link>
										: product.productTitle}
								</Stack>
							</TableCell>
							<TableCell>{formatProductPrice(product)}</TableCell>
							<TableCell>{product.memberData?.memberNick ?? '—'}</TableCell>
							<TableCell>{humanizeProductValue(product.productRegion)}</TableCell>
							<TableCell>{humanizeProductValue(product.productType)} / {humanizeProductValue(product.productCategory)}</TableCell>
							<TableCell>
								{product.productStatus === ProductStatus.DELETE ? (
									<Button aria-label="Permanently remove listing" onClick={() => removeProductHandler(product)}><DeleteIcon /></Button>
								) : (
									<>
										<Button onClick={(event) => setMenu({ anchor: event.currentTarget, product })}>{humanizeProductValue(product.productStatus)}</Button>
										{menu?.product._id === product._id && (
											<Menu anchorEl={menu.anchor} open onClose={() => setMenu(null)}>
												{Object.values(ProductStatus).filter((status) => status !== product.productStatus).map((status) => (
													<MenuItem key={status} onClick={async () => {
														await updateProductHandler({ _id: product._id, productStatus: status });
														setMenu(null);
													}}>{humanizeProductValue(status)}</MenuItem>
												))}
											</Menu>
										)}
									</>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};