import {
	ProductBookingType,
	ProductCategory,
	ProductPriceUnit,
	ProductRegion,
	ProductStatus,
	ProductType,
} from '../../enums/product.enum';

export interface ProductUpdate {
	_id: string;
	productType?: ProductType;
	productStatus?: ProductStatus;
	productCategory?: ProductCategory;
	productRegion?: ProductRegion;
	productAddress?: string;
	productTitle?: string;
	productPrice?: number;
	productCurrency?: string;
	productPriceUnit?: ProductPriceUnit;
	productBookingType?: ProductBookingType;
	productImages?: string[];
	productDesc?: string;
	productDetails?: Record<string, unknown>;
}