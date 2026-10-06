import React, { useState } from 'react';
import { Box, Button, Divider, IconButton, Stack, TextField, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CREATE_COMMENT, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_PRODUCT, GET_PRODUCTS } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import ProductBigCard from '../../libs/components/common/ProductBigCard';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import { REACT_APP_API_URL } from '../../libs/config';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Product } from '../../libs/types/product/product';
import { formatProductPrice, getProductImage, humanizeProductValue } from '../../libs/utils/product';

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const ProductDetail: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const productId = router.query.id as string | undefined;
	const [comment, setComment] = useState('');
	const { data, loading, refetch } = useQuery(GET_PRODUCT, {
		variables: { productId },
		skip: !productId,
		fetchPolicy: 'network-only',
	});
	const product: Product | undefined = data?.getProduct;
	const { data: relatedData, refetch: refetchRelated } = useQuery(GET_PRODUCTS, {
		variables: {
			input: {
				page: 1,
				limit: 6,
				sort: 'productRank',
				direction: Direction.DESC,
				search: { regionList: product?.productRegion ? [product.productRegion] : [] },
			},
		},
		skip: !product,
	});
	const commentsInput = { page: 1, limit: 20, sort: 'createdAt', direction: Direction.DESC, search: { commentRefId: productId } };
	const { data: commentsData, refetch: refetchComments } = useQuery(GET_COMMENTS, {
		variables: { input: commentsInput },
		skip: !productId,
	});
	const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const [createComment] = useMutation(CREATE_COMMENT);

	const like = async (_user: unknown, id: string) => {
		if (!user._id) return sweetMixinErrorAlert(Message.NOT_AUTHENTICATED);
		await likeTargetProduct({ variables: { productId: id } });
		await Promise.all([refetch({ productId: id }), refetchRelated()]);
	};

	const submitComment = async () => {
		if (!user._id) return sweetMixinErrorAlert(Message.NOT_AUTHENTICATED);
		if (!comment.trim() || !productId) return;
		await createComment({
			variables: {
				input: { commentGroup: CommentGroup.PRODUCT, commentContent: comment.trim(), commentRefId: productId },
			},
		});
		setComment('');
		await refetchComments({ input: commentsInput });
		await sweetTopSmallSuccessAlert('Review added.');
	};

	if (loading) return <Typography sx={{ p: 6 }}>Loading listing…</Typography>;
	if (!product) return <Typography sx={{ p: 6 }}>Listing not found.</Typography>;

	return (
		<div id="product-detail-page">
			<Stack className="container" spacing={4}>
				<Stack className="product-info-config" spacing={2}>
					<Typography className="title-main" variant="h3">{product.productTitle}</Typography>
					<Typography>{product.productAddress} · {humanizeProductValue(product.productRegion)}</Typography>
					<Stack direction="row" spacing={2} alignItems="center">
						<Typography variant="h5">{formatProductPrice(product, router.locale)}</Typography>
						<Typography>{humanizeProductValue(product.productPriceUnit)}</Typography>
						<RemoveRedEyeIcon /><Typography>{product.productViews}</Typography>
						<IconButton onClick={() => like(user, product._id)}>
							{product.meLiked?.[0]?.myFavorite ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
						</IconButton>
						<Typography>{product.productLikes}</Typography>
					</Stack>
					<Box
						component="img"
						src={getProductImage(product, REACT_APP_API_URL)}
						alt={product.productTitle}
						sx={{ width: '100%', maxHeight: 560, objectFit: 'cover', borderRadius: 3 }}
					/>
					<Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
						{product.productImages.slice(1).map((image) => (
							<Box component="img" key={image} src={`${REACT_APP_API_URL}/${image}`} alt="" sx={{ width: 140, height: 90, objectFit: 'cover', borderRadius: 2 }} />
						))}
					</Stack>
				</Stack>

				<Stack className="product-desc-config" spacing={2}>
					<Typography variant="h5">About this listing</Typography>
					<Typography>{product.productDesc || 'No description has been provided.'}</Typography>
					<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
						<Typography><strong>Type:</strong> {humanizeProductValue(product.productType)}</Typography>
						<Typography><strong>Category:</strong> {humanizeProductValue(product.productCategory)}</Typography>
						<Typography><strong>Booking:</strong> {humanizeProductValue(product.productBookingType)}</Typography>
						<Typography><strong>Status:</strong> {humanizeProductValue(product.productStatus)}</Typography>
					</Stack>
					{product.productDetails && Object.keys(product.productDetails).length > 0 && (
						<Stack spacing={1}>
							<Typography variant="h6">Listing details</Typography>
							{Object.entries(product.productDetails).map(([key, value]) => (
								<Typography key={key}><strong>{humanizeProductValue(key)}:</strong> {String(value)}</Typography>
							))}
						</Stack>
					)}
				</Stack>

				{product.memberData && (
					<Stack spacing={1}>
						<Typography variant="h5">Provided by</Typography>
						<Link href={`/providers/detail?memberId=${product.memberData._id}`}>{product.memberData.memberNick}</Link>
						<Typography>{product.memberData.memberDesc}</Typography>
					</Stack>
				)}

				<Divider />
				<Stack spacing={2}>
					<Typography variant="h5">Reviews</Typography>
					{commentsData?.getComments?.list?.map((item: any) => (
						<Stack key={item._id}>
							<Typography fontWeight={600}>{item.memberData?.memberNick ?? 'Traveller'}</Typography>
							<Typography>{item.commentContent}</Typography>
						</Stack>
					))}
					<TextField multiline minRows={3} label="Share your experience" value={comment} onChange={(event) => setComment(event.target.value)} />
					<Button variant="contained" onClick={submitComment}>Add review</Button>
				</Stack>

				{relatedData?.getProducts?.list?.length > 0 && (
					<Stack spacing={2}>
						<Typography variant="h5">More listings in this region</Typography>
						<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
							{relatedData.getProducts.list.filter((item: Product) => item._id !== product._id).slice(0, 3).map((item: Product) => (
								<ProductBigCard key={item._id} product={item} likeProductHandler={like} />
							))}
						</Stack>
					</Stack>
				)}
			</Stack>
		</div>
	);
};

export default withLayoutFull(ProductDetail);