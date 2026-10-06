import React from 'react';
import { IconButton, Stack, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { userVar } from '../../../apollo/store';
import { REACT_APP_API_URL } from '../../config';
import { Member } from '../../types/member/member';

const AgentCard = ({ agent, likeMemberHandler }: { agent: Member; likeMemberHandler: any }) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	return (
		<Stack className="agent-general-card" onClick={() => router.push({ pathname: '/providers/detail', query: { memberId: agent._id } })}>
			<img className="agent-img" src={agent.memberImage ? `${REACT_APP_API_URL}/${agent.memberImage}` : '/img/profile/defaultUser.svg'} alt={agent.memberNick} />
			<Stack className="agent-desc">
				<strong>{agent.memberFullName ?? agent.memberNick}</strong>
				<Typography>Provider · {agent.memberProducts} listings</Typography>
				<Stack direction="row" alignItems="center">
					<RemoveRedEyeIcon /><Typography>{agent.memberViews}</Typography>
					<IconButton onClick={(event) => { event.stopPropagation(); likeMemberHandler(user, agent._id); }}>
						{agent.meLiked?.[0]?.myFavorite ? <FavoriteIcon color="primary" /> : <FavoriteBorderIcon />}
					</IconButton>
					<Typography>{agent.memberLikes}</Typography>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default AgentCard;