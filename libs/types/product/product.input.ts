import {
	ProductBookingType,
	ProductCategory,
	ProductPriceUnit,
	ProductRegion,
	ProductStatus,
	ProductType,
} from '../../enums/product.enum';
import { Direction } from '../../enums/common.enum';

export interface ProductInput {
	productType: ProductType;
	productCategory: ProductCategory;
	productRegion: ProductRegion;
	productAddress: string;
	productTitle: string;
	productPrice: number;
	productCurrency?: string;
	productPriceUnit: ProductPriceUnit;
	productBookingType: ProductBookingType;
	productImages: string[];
	productDesc?: string;
	productDetails?: Record<string, unknown>;
	memberId?: string;
}

export interface PricesRange {
	start: number;
	end: number;
}

export interface PeriodsRange {
	start: Date | number;
	end: Date | number;
}

interface ProductSearch {
	memberId?: string;
	regionList?: ProductRegion[];
	typeList?: ProductType[];
	categoryList?: ProductCategory[];
	bookingTypeList?: ProductBookingType[];
	pricesRange?: PricesRange;
	periodsRange?: PeriodsRange;
	text?: string;
}

export interface ProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ProductSearch;
}

interface AgentProductsSearch {
	productStatus?: ProductStatus;
}

export interface AgentProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AgentProductsSearch;
}

interface AllProductsSearch {
	memberId?: string;
	productStatus?: ProductStatus;
	productRegionList?: ProductRegion[];
	productTypeList?: ProductType[];
	productCategoryList?: ProductCategory[];
	productBookingTypeList?: ProductBookingType[];
	pricesRange?: PricesRange;
	periodsRange?: PeriodsRange;
	text?: string;
}

export interface AllProductsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: AllProductsSearch;
}