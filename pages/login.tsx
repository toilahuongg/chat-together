import ClientLayout from "@src/Components/Client/ClientLayout"
import TextField from "@src/Components/Client/TextField";
import Button from "@src/Components/Client/Button";

import User from '@src/styles/svg/user2.svg';
import Key from '@src/styles/svg/key.svg';
import Back from '@src/styles/svg/arrow-left.svg';
import styles from './style.module.scss';
import { useRouter } from "next/router";
const LoginPage = () => {
    const router = useRouter();
    return (
        <ClientLayout>
            <div className={styles.back} onClick={() => router.push('/')}> <Back /> <span>  Quay lại </span></div>
            <h1 className={styles.title}> Đăng Nhập</h1>
            <TextField icon={<User />} placeholder="Enter your username or email..." />
            <TextField icon={<Key />} placeholder="Enter your Password..." />
            <Button variable="submit-login"> Đăng nhập </Button>
        </ClientLayout>
    );
}

export default LoginPage;