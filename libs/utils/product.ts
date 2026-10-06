import { Product } from '../types/product/product';

export const humanizeProductValue = (value?: string) =>
	value ? value.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : '';

export const formatProductPrice = (product: Product, locale = 'en') => {
	try {
		return new Intl.NumberFormat(locale, {
			style: 'currency',
			currency: product.productCurrency || 'KRW',
			maximumFractionDigits: 2,
		}).format(product.productPrice);
	} catch {
		return `${product.productPrice.toLocaleString()} ${product.productCurrency || 'KRW'}`;
	}
};

export const getProductImage = (product: Product, apiUrl = '') =>
	product.productImages?.[0] ? `${apiUrl}/${product.productImages[0]}` : '/img/banner/cities/SEOUL.webp';