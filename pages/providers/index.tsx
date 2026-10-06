import React, { useMemo, useState } from 'react';
import { MenuItem, Pagination, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { LIKE_TARGET_MEMBER } from '../../apollo/user/mutation';
import { GET_AGENTS } from '../../apollo/user/query';
import { userVar } from '../../apollo/store';
import AgentCard from '../../libs/components/common/AgentCard';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import { Direction, Message } from '../../libs/enums/common.enum';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { AgentsInquiry } from '../../libs/types/member/member.input';
import { Member } from '../../libs/types/member/member';

export const getStaticProps = async ({ locale }: any) => ({ props: { ...(await serverSideTranslations(locale, ['common'])) } });

const ProviderList: NextPage = ({ initialInput }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const urlInput = useMemo(() => {
		try { return router.query.input ? JSON.parse(router.query.input as string) as AgentsInquiry : null; } catch { return null; }
	}, [router.query.input]);
	const [inquiry, setInquiry] = useState<AgentsInquiry>(urlInput ?? initialInput);
	const { data, refetch } = useQuery(GET_AGENTS, { variables: { input: inquiry }, fetchPolicy: 'network-only' });
	const [likeMember] = useMutation(LIKE_TARGET_MEMBER);
	const providers: Member[] = data?.getAgents?.list ?? [];
	const total = data?.getAgents?.metaCounter?.[0]?.total ?? 0;

	const apply = async (next: AgentsInquiry) => {
		setInquiry(next);
		await router.push({ pathname: '/providers', query: { input: JSON.stringify(next) } }, undefined, { scroll: false });
	};

	const likeMemberHandler = async (_currentUser: unknown, id: string) => {
		try {
			if (!user._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeMember({ variables: { input: id } });
			await refetch({ input: inquiry });
		} catch (error: any) {
			await sweetMixinErrorAlert(error.message);
		}
	};

	return (
		<Stack className="agent-list-page">
			<Stack className="container" spacing={3}>
				<Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
					<TextField label="Search providers" value={inquiry.search.text ?? ''} onChange={(event) => apply({ ...inquiry, page: 1, search: { text: event.target.value || undefined } })} />
					<TextField select label="Sort by" value={inquiry.sort ?? 'createdAt'} onChange={(event) => apply({ ...inquiry, page: 1, sort: event.target.value })}>
						<MenuItem value="createdAt">Newest</MenuItem><MenuItem value="memberRank">Top ranked</MenuItem><MenuItem value="memberLikes">Most liked</MenuItem>
					</TextField>
				</Stack>
				<Stack className="agent-card-wrap" direction={{ xs: 'column', md: 'row' }} flexWrap="wrap" gap={2}>
					{providers.length ? providers.map((provider) => <AgentCard key={provider._id} agent={provider} likeMemberHandler={likeMemberHandler} />) : <Typography>No providers found.</Typography>}
				</Stack>
				{providers.length > 0 && <><Pagination page={inquiry.page} count={Math.ceil(total / inquiry.limit) || 1} onChange={(_event, page) => apply({ ...inquiry, page })} /><Typography>{total} provider{total === 1 ? '' : 's'} available</Typography></>}
			</Stack>
		</Stack>
	);
};

ProviderList.defaultProps = { initialInput: { page: 1, limit: 9, sort: 'createdAt', direction: Direction.DESC, search: {} } };
export default withLayoutBasic(ProviderList);