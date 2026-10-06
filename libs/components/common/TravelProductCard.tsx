import React from 'react';
import { Divider, IconButton, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Product } from '../../types/product/product';
import { formatProductPrice, getProductImage, humanizeProductValue } from '../../utils/product';

interface TravelProductCardProps {
	product: Product;
	className?: string;
	likeProductHandler?: (user: unknown, id: string) => void;
	showLikes?: boolean;
}

const TravelProductCard = ({ product, className = 'product-card-box', likeProductHandler, showLikes = true }: TravelProductCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const openDetail = () => router.push({ pathname: '/products/detail', query: { id: product._id } });

	return (
		<Stack className={className}>
			<button
				className="card-img"
				onClick={openDetail}
				aria-label={`Open ${product.productTitle}`}
				style={{ backgroundImage: `url(${getProductImage(product, REACT_APP_API_URL)})`, border: 0 }}
			>
				{product.productRank > 0 && <span className="status">Top</span>}
				<span className="price">{formatProductPrice(product, router.locale)}</span>
			</button>
			<div className="info">
				<strong className="title" onClick={openDetail}>{product.productTitle}</strong>
				<p className="desc">{product.productAddress} · {humanizeProductValue(product.productRegion)}</p>
				<div className="options">
					<span>{humanizeProductValue(product.productType)}</span>
					<span>{humanizeProductValue(product.productCategory)}</span>
					<span>{humanizeProductValue(product.productBookingType)}</span>
				</div>
				<Divider sx={{ mt: '15px', mb: '12px' }} />
				<div className="bott">
					<Typography>{humanizeProductValue(product.productPriceUnit)}</Typography>
					<div className="view-like-box">
						<RemoveRedEyeIcon fontSize="small" />
						<Typography className="view-cnt">{product.productViews}</Typography>
						{showLikes && (
							<>
								<IconButton aria-label="Favorite listing" onClick={(event) => {
									event.stopPropagation();
									likeProductHandler?.(user, product._id);
								}}>
									{product.meLiked?.[0]?.myFavorite ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
								</IconButton>
								<Typography className="view-cnt">{product.productLikes}</Typography>
							</>
						)}
					</div>
				</div>
			</div>
		</Stack>
	);
};

export default TravelProductCard;