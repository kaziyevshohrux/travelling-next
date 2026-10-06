import React, { useState } from 'react';
import { Box, Button, Pagination, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CREATE_COMMENT, LIKE_TARGET_PRODUCT } from '../../apollo/user/mutation';
import { GET_COMMENTS, GET_MEMBER, GET_PRODUCTS } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import ProductBigCard from '../../libs/components/common/ProductBigCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { REACT_APP_API_URL } from '../../libs/config';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';
import { Product } from '../../libs/types/product/product';

export const getStaticProps = async ({ locale }: any) => ({
	props: { ...(await serverSideTranslations(locale, ['common'])) },
});

const ProviderDetail: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const memberId = (router.query.memberId ?? router.query.agentId) as string | undefined;
	const [productPage, setProductPage] = useState(1);
	const [commentPage, setCommentPage] = useState(1);
	const [review, setReview] = useState('');
	const { data: memberData } = useQuery(GET_MEMBER, { variables: { input: memberId }, skip: !memberId });
	const productsInput = { page: productPage, limit: 6, sort: 'productRank', direction: Direction.DESC, search: { memberId } };
	const { data: productsData, refetch: refetchProducts } = useQuery(GET_PRODUCTS, { variables: { input: productsInput }, skip: !memberId });
	const commentsInput = { page: commentPage, limit: 5, sort: 'createdAt', direction: Direction.DESC, search: { commentRefId: memberId } };
	const { data: commentsData, refetch: refetchComments } = useQuery(GET_COMMENTS, { variables: { input: commentsInput }, skip: !memberId });
	const [likeProduct] = useMutation(LIKE_TARGET_PRODUCT);
	const [createComment] = useMutation(CREATE_COMMENT);
	const provider = memberData?.getMember;
	const products: Product[] = productsData?.getProducts?.list ?? [];
	const productTotal = productsData?.getProducts?.metaCounter?.[0]?.total ?? 0;
	const commentTotal = commentsData?.getComments?.metaCounter?.[0]?.total ?? 0;

	const likeProductHandler = async (_currentUser: unknown, id: string) => {
		if (!user._id) return sweetMixinErrorAlert(Message.NOT_AUTHENTICATED);
		await likeProduct({ variables: { productId: id } });
		await refetchProducts({ input: productsInput });
	};

	const submitReview = async () => {
		if (!user._id) return sweetMixinErrorAlert(Message.NOT_AUTHENTICATED);
		if (!memberId || !review.trim() || user._id === memberId) return;
		await createComment({ variables: { input: { commentGroup: CommentGroup.MEMBER, commentContent: review.trim(), commentRefId: memberId } } });
		setReview('');
		await refetchComments({ input: commentsInput });
		await sweetTopSmallSuccessAlert('Review added.', 800);
	};

	if (!provider) return <Typography sx={{ p: 6 }}>Loading provider…</Typography>;

	return (
		<Stack className="agent-detail-page">
			<Stack className="container" spacing={4}>
				<Stack className="agent-info" direction="row" spacing={2}>
					<Box component="img" src={provider.memberImage ? `${REACT_APP_API_URL}/${provider.memberImage}` : '/img/profile/defaultUser.svg'} alt="" sx={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' }} />
					<Stack>
						<Typography variant="h4">{provider.memberFullName ?? provider.memberNick}</Typography>
						<Typography>{provider.memberDesc}</Typography>
						<Typography>{provider.memberPhone}</Typography>
						<Typography>{provider.memberProducts} listings</Typography>
					</Stack>
				</Stack>
				<Typography variant="h5">Listings from this provider</Typography>
				<Stack className="card-wrap" direction={{ xs: 'column', md: 'row' }} flexWrap="wrap" gap={2}>
					{products.map((product) => <ProductBigCard key={product._id} product={product} likeProductHandler={likeProductHandler} />)}
				</Stack>
				{productTotal > 0 && <Pagination page={productPage} count={Math.ceil(productTotal / 6)} onChange={(_event, page) => setProductPage(page)} />}
				<Stack className="review-box" spacing={2}>
					<Typography variant="h5">Provider reviews</Typography>
					{commentsData?.getComments?.list?.map((comment: any) => (
						<Stack key={comment._id}><Typography fontWeight={600}>{comment.memberData?.memberNick ?? 'Traveller'}</Typography><Typography>{comment.commentContent}</Typography></Stack>
					))}
					{commentTotal > 0 && <Pagination page={commentPage} count={Math.ceil(commentTotal / 5)} onChange={(_event, page) => setCommentPage(page)} />}
					<TextField multiline minRows={3} label="Review this provider" value={review} onChange={(event) => setReview(event.target.value)} />
					<Button variant="contained" onClick={submitReview} disabled={!review.trim() || user._id === memberId}>Submit review</Button>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withLayoutBasic(ProviderDetail);