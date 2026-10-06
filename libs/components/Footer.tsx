import React from 'react';
import { Stack, Typography } from '@mui/material';
import FacebookOutlinedIcon from '@mui/icons-material/FacebookOutlined';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';
import TwitterIcon from '@mui/icons-material/Twitter';
import { useTranslation } from 'next-i18next';

const Footer = () => {
	const { t } = useTranslation('common');
	return (
		<Stack className="footer-container">
			<Stack className="main" direction={{ xs: 'column', md: 'row' }}>
				<Stack className="left">
					<div className="footer-box"><img src="/img/logo/logoWhite.svg" alt="Travelling" className="logo" /></div>
					<div className="footer-box"><Typography>Plan memorable journeys across South Korea.</Typography></div>
					<div className="footer-box"><Typography>Follow Travelling</Typography><div className="media-box"><FacebookOutlinedIcon /><TelegramIcon /><InstagramIcon /><TwitterIcon /></div></div>
				</Stack>
				<Stack className="right">
					<div className="bottom">
						<div><strong>{t('Listings')}</strong><span>Hotels</span><span>Tours</span><span>Activities</span><span>Transport</span><span>Restaurants</span></div>
						<div><strong>{t('Support')}</strong><span>Help center</span><span>Safety</span><span>Terms of use</span><span>Privacy policy</span></div>
						<div><strong>Discover Korea</strong><span>Seoul</span><span>Busan</span><span>Jeju</span><span>Incheon</span><span>Daegu</span></div>
					</div>
				</Stack>
			</Stack>
			<Stack className="second"><span>© Travelling {new Date().getFullYear()}. All rights reserved.</span><span>Privacy · Terms · Sitemap</span></Stack>
		</Stack>
	);
};

export default Footer;