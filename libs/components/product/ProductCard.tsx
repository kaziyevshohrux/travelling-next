import React from 'react';
import { Product } from '../../types/product/product';
import TravelProductCard from '../common/TravelProductCard';

interface ProductCardProps {
	product: Product;
	likeProductHandler?: any;
	myFavorites?: boolean;
	recentlyVisited?: boolean;
}

const ProductCard = ({ product, likeProductHandler, recentlyVisited }: ProductCardProps) => (
	<TravelProductCard
		product={product}
		className="card-config"
		likeProductHandler={likeProductHandler}
		showLikes={!recentlyVisited}
	/>
);

export default ProductCard;