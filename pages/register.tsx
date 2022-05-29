import { useRouter } from "next/router";
import { useState } from "@hookstate/core";
import { FormEvent } from "react";
import { toast } from "react-toastify";

import GuestLayout from "@src/Components/Guest/GuestLayout"
import TextField from "@src/Components/Layout/TextField";
import Button from "@src/Components/Layout/Button";
import useUser from "@src/hooks/useUser";
import { defaultUser } from "@src/constants/user.constant";
import {
    validateConfirmPassword,
    validateEmail,
    validateFullname,
    validatePassword,
    validatePhone,
    validateUsername
} from "@src/validators/user.validator";

import User from '@src/styles/svg/user2.svg';
import Email from '@src/styles/svg/email.svg';
import Telephone from '@src/styles/svg/telephone.svg';
import Key from '@src/styles/svg/key.svg';
import Back from '@src/styles/svg/arrow-left.svg';
import styles from './style.module.scss';
import withGuest from "@src/Components/Guest/withGuest";

const RegisterPage = () => {
    const router = useRouter();
    const user = useUser();
    const loadingState = useState(false);
    const errorState = useState({ ...defaultUser(), confirmPassword: ''});
    const confirmPassword = useState('');
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            errorState.password.get()
            || errorState.username.get()
            || errorState.email.get()
            || errorState.fullname.get()
            || errorState.phone.get()
        ) return;
        let id;
        try {
            loadingState.set(true);
            id = toast.loading('Đang đăng ký!');
            await user.registerUser();
            toast.update(id, {render: "Đăng ký thành công", type: "success", isLoading: false, autoClose: 3000 });
            loadingState.set(false);
            router.push('/login');
        } catch (error) {
            loadingState.set(false);

            console.log(error);
            // TODO
            toast.update(id, {render: "Đã xảy ra lỗi", type: "error", isLoading: false, autoClose: 3000 });
        }
    }
    return (
        <GuestLayout isRegister>
            <div className={styles.back} onClick={() => router.push('/')}> <Back /> <span>  Quay lại </span></div>
            <h1 className={styles.title}> Đăng ký</h1>
            <form onSubmit={handleSubmit}>
                <TextField
                    icon={<User />}
                    placeholder="Enter your username..."
                    value={user.username.get()}
                    onChange={(val) => user.username.set(val)}
                    onKeyUp={(e) => validateUsername((e.target as any).value, errorState.username)}
                    errorMessage={errorState.username.get()}
                />
                <TextField
                    icon={<User />}
                    placeholder="Enter your fullname..."
                    value={user.fullname.get()}
                    onChange={(val) => user.fullname.set(val)}
                    onKeyUp={(e) => validateFullname((e.target as any).value, errorState.fullname)}
                    errorMessage={errorState.fullname.get()}
                />
                <TextField
                    type="email"
                    icon={<Email />}
                    placeholder="Enter your email..."
                    value={user.email.get()}
                    onChange={(val) => user.email.set(val)}
                    onKeyUp={(e) => validateEmail((e.target as any).value, errorState.email)}
                    errorMessage={errorState.email.get()}
                />
                <TextField
                    icon={<Telephone />}
                    placeholder="Enter your phone..."
                    value={user.phone.get()}
                    onChange={(val) => user.phone.set(val)}
                    onKeyUp={(e) => validatePhone((e.target as any).value, errorState.phone)}
                    errorMessage={errorState.phone.get()}
                />
                <TextField
                    type="password"
                    icon={<Key />}
                    placeholder="Enter your Password..."
                    value={user.password.get()}
                    onChange={(val) => user.password.set(val)}
                    onKeyUp={(e) => validatePassword((e.target as any).value, errorState.password)}
                    errorMessage={errorState.password.get()}
                />
                <TextField
                    type="password"
                    icon={<Key />}
                    placeholder="Confirm password..."
                    value={confirmPassword.get()}
                    onChange={(val) => confirmPassword.set(val)}
                    onKeyUp={(e) => validateConfirmPassword((e.target as any).value, user.password.get(), errorState.confirmPassword)}
                    errorMessage={errorState.confirmPassword.get()}
                />
                <Button
                    type="submit"
                    variable="submit-login"
                    loading={loadingState.get()}
                > Đăng ký </Button>
            </form>
        </GuestLayout>
    );
}

export default withGuest(RegisterPage);