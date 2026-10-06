import React from 'react';
import { Product } from '../../types/product/product';
import TravelProductCard from '../common/TravelProductCard';

const PopularProductCard = ({ product }: { product: Product }) => (
	<TravelProductCard product={product} className="popular-card-box" showLikes={false} />
);

export default PopularProductCard;