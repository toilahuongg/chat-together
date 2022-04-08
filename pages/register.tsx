import ClientLayout from "@src/Components/Client/ClientLayout"
import TextField from "@src/Components/Client/TextField";
import Button from "@src/Components/Client/Button";

import User from '@src/styles/svg/user2.svg';
import Email from '@src/styles/svg/email.svg';
import Key from '@src/styles/svg/key.svg';
import Back from '@src/styles/svg/arrow-left.svg';
import styles from './style.module.scss';
import { useRouter } from "next/router";
const RegisterPage = () => {
    const router = useRouter();
    return (
        <ClientLayout isRegister>
            <div className={styles.back} onClick={() => router.push('/')}> <Back /> <span>  Quay lại </span></div>
            <h1 className={styles.title}> Đăng ký</h1>
            <TextField icon={<User />} placeholder="Enter your username..." />
            <TextField icon={<Email />} placeholder="Enter your email..." />
            <TextField icon={<Key />} placeholder="Enter your Password..." />
            <TextField icon={<Key />} placeholder="Confirm password..." />
            <Button variable="submit-login"> Đăng ký </Button>
        </ClientLayout>
    );
}

export default RegisterPage;