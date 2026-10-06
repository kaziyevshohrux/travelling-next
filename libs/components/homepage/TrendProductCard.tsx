import React from 'react';
import { Product } from '../../types/product/product';
import TravelProductCard from '../common/TravelProductCard';

const TrendProductCard = ({ product, likeProductHandler }: { product: Product; likeProductHandler: any }) => (
	<TravelProductCard product={product} className="trend-card-box" likeProductHandler={likeProductHandler} />
);

export default TrendProductCard;