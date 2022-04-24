import React, { FormEvent } from "react";
import { useRouter } from "next/router";
import { NextPage } from "next";
import { StateMethods, useState } from "@hookstate/core";

import GuestLayout from "@src/Components/Guest/GuestLayout"
import TextField from "@src/Components/Guest/TextField";
import Button from "@src/Components/Guest/Button";
import { useUser } from "@src/hooks/useUser";

import User from '@src/styles/svg/user2.svg';
import Key from '@src/styles/svg/key.svg';
import Back from '@src/styles/svg/arrow-left.svg';
import styles from './style.module.scss';
import { toast } from "react-toastify";
import useAuth from "@src/hooks/useAuth";
import withGuest from "@src/Components/withGuest";
const LoginPage: NextPage = () => {
    const router = useRouter();
    const user = useUser();
    const { setAccessToken, setRefreshToken } = useAuth();
    const [loading, setLoading] = React.useState(false);
    const errorState = useState({ username: '', password: '' });
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (errorState.password.get() || errorState.username.get()) return;
        let id;
        try {
            setLoading(true);
            id = toast.loading('Đang đăng nhập!');
            const { accessToken, refreshToken } = await user.loginUser() as { accessToken: string, refreshToken: string };
            setAccessToken(accessToken);
			setRefreshToken(refreshToken);
            toast.update(id, {render: "Đăng nhập thành công", type: "success", isLoading: false });
        } catch (error) {
            console.log(error);
            // TODO
            toast.update(id, {render: "Đã xảy ra lỗi", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    }

    const handleKeyUp = (value: string, state: StateMethods<string>, message: string) => {
        if (value) state.set('');
        else state.set(message);
    }

    return (
        <GuestLayout>
            <div className={styles.back} onClick={() => router.push('/')}> <Back /> <span>  Quay lại </span></div>
            <h1 className={styles.title}> Đăng Nhập</h1>
            <form onSubmit={handleSubmit}>
                <TextField
                    icon={<User />}
                    placeholder="Enter your username or email..."
                    value={user.username.get()}
                    onChange={(val: string) => user.username.set(val)}
                    onKeyUp={(e) => handleKeyUp((e.target as any).value, errorState.username, 'Tài khoản không được để trống')}
                    errorMessage={errorState.username.get()}
                />
                <TextField
                    type="password"
                    icon={<Key />}
                    placeholder="Enter your Password..."
                    value={user.password.get()}
                    onChange={(val: string) => user.password.set(val)}
                    onKeyUp={(e) => handleKeyUp((e.target as any).value, errorState.password, 'Mật khẩu không được để trống')}
                    errorMessage={errorState.password.get()}
                />
                <Button
                    type="submit"
                    variable="submit-login"
                    loading={loading}
                > Đăng nhập </Button>
            </form>
            
        </GuestLayout>
    );
}

export default withGuest(LoginPage);