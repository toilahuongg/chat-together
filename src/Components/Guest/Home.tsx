import { useRouter } from 'next/router';
import { FacebookAuthProvider, getAuth, GithubAuthProvider, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import axios from 'axios';
import { useCallback, useState } from 'react';

import Button from '../Layout/Button';
import '@src/config/config-firebase';
import User from '@src/styles/svg/user.svg';
import Google from '@src/styles/svg/google.svg';
import Facebook from '@src/styles/svg/facebook.svg';
import Github from '@src/styles/svg/github.svg';
import GuestLayout from './GuestLayout';
import { toast } from 'react-toastify';
import useAuth from '@src/hooks/useAuth';
import useSocket from '@src/hooks/useSocket';
import Head from 'next/head';

type TProviderID = 'google' | 'facebook' | 'github';
const ClientHome = () => {
	const router = useRouter();
	const { setAccessToken, setRefreshToken } = useAuth();
	const socket = useSocket();
	const [loading, setLoading] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

	const getProvider = useCallback((providerId: TProviderID) => {
		switch (providerId) {
			case 'google':
				return new GoogleAuthProvider();
			case 'facebook':
				return new FacebookAuthProvider();
			case 'github':
				return new GithubAuthProvider();
		}
	}, []);
	const oauthLogin = async (providerId: TProviderID) => {
		setLoading(providerId);
		const provider = getProvider(providerId);
		const auth = getAuth();
		try {
			const result = await signInWithPopup(auth, provider);
			const user = result.user;
			console.log(user);
			const { email, photoURL } = user;
			let fullname = user.displayName;
			// @ts-ignore
			if (providerId === 'github') fullname = user.reloadUserInfo.screenName;
			const response = await axios.post('/api/auth/sign-in-with-social', { displayName: fullname, email, avatar: photoURL });
			const { accessToken, refreshToken } = response.data;
			setAccessToken(accessToken);
			setRefreshToken(refreshToken);
			socket.auth = {
				token: accessToken
			}
			socket.connect();
			await signOut(auth);
			setErrorMessage('');
			toast.success("Đăng nhập thành công");
			// router.push('/');

		} catch (error: any) {
			if (error?.customData?.email && error.code === 'auth/account-exists-with-different-credential') {
				setErrorMessage(`Email ${error.customData.email} đã được sử dụng bởi một phương thức đăng nhập khác ${providerId.charAt(0).toUpperCase() + providerId.slice(1)}.`);
				toast.error("Đã xảy ra lỗi");
			}
		} finally {
			setLoading('');
		}
	}
	return (
		<>
			<Head>
				<title> Chat together </title>
			</Head>
			<GuestLayout errorMessage={errorMessage}>
				<Button variable="default-guest" onClick={() => router.push('/login')} icon={<User />}> Đăng nhập </Button>
				<Button variable="login-google" icon={<Google />} onClick={() => oauthLogin('google')} loading={loading === 'google'}> Tiếp tục với Google </Button>
				<Button variable="login-facebook" icon={<Facebook />} onClick={() => oauthLogin('facebook')} loading={loading === 'facebook'}> Tiếp tục với Facebook </Button>
				<Button variable="login-github" icon={<Github />} onClick={() => oauthLogin('github')} loading={loading === 'github'}> Tiếp tục với Github </Button>
			</GuestLayout>
		</>
	)
}

export default ClientHome;