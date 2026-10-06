import React from 'react';
import { Product } from '../../types/product/product';
import TravelProductCard from './TravelProductCard';

const ProductBigCard = ({ product, likeProductHandler }: { product: Product; likeProductHandler: any }) => (
	<TravelProductCard product={product} className="product-big-card-box" likeProductHandler={likeProductHandler} />
);

export default ProductBigCard;