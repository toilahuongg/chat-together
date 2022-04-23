import Link from 'next/link';
import { ReactNode } from 'react';
import Slider from './Slider';

import Or from '@src/styles/svg/or.svg';
import styles from './client.module.scss';

type TProps = {
	children: ReactNode,
	isRegister?: boolean,
	errorMessage?: string
}
const GuestLayout: React.FC<TProps> = ({ children, isRegister, errorMessage }) => {
	
	return (
		<div className={styles.wrapper}>
			<div>
				<div className={styles.container}>
					{ children}
					{errorMessage && <p className={styles.errorMessage}> {errorMessage} </p> }
					<div className={styles.or}>
						<div><Or /></div>
						{ !isRegister ? (<p> Bạn chưa có tài khoản? <Link href="/register"> Đăng ký</Link></p>):
							(<p> Bạn đã có tài khoản? <Link href="/login"> Đăng nhập</Link></p>)
						}
					</div>
				</div>
			</div>
			<div>
				<div className="slider">
					<Slider />
				</div>
			</div>
		</div>
	)
}

export default GuestLayout;