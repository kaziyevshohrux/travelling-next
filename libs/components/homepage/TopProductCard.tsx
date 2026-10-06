import React from 'react';
import { Product } from '../../types/product/product';
import TravelProductCard from '../common/TravelProductCard';

const TopProductCard = ({ product, likeProductHandler }: { product: Product; likeProductHandler: any }) => (
	<TravelProductCard product={product} className="top-card-box" likeProductHandler={likeProductHandler} />
);

export default TopProductCard;