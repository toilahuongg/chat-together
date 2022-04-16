import { FormEvent } from "react";
import { useRouter } from "next/router";
import { StateMethods, useState } from "@hookstate/core";

import ClientLayout from "@src/Components/Client/ClientLayout"
import TextField from "@src/Components/Client/TextField";
import Button from "@src/Components/Client/Button";
import { useUser } from "@src/hooks/useUser";

import User from '@src/styles/svg/user2.svg';
import Key from '@src/styles/svg/key.svg';
import Back from '@src/styles/svg/arrow-left.svg';
import styles from './style.module.scss';
import { toast } from "react-toastify";
const LoginPage = () => {
    const router = useRouter();
    const user = useUser();
    const loadingState = useState(false);
    const errorState = useState({ username: '', password: '' });
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (errorState.password.get() || errorState.username.get()) return;
        let id;
        try {
            loadingState.set(true);
            id = toast.loading('Đang đăng nhập!');
            const { token, refreshToken } = await user.loginUser() as { token: string, refreshToken: string };
            window.localStorage.setItem('token', token);
            window.localStorage.setItem('refreshToken', refreshToken);
            toast.update(id, {render: "Đăng nhập thành công", type: "success", isLoading: false });
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } catch (error) {
            console.log(error);
            // TODO
            toast.update(id, {render: "Đã xảy ra lỗi", type: "error", isLoading: false, autoClose: 3000 });
        } finally {
            loadingState.set(false);
        }
    }

    const handleKeyUp = (value: string, state: StateMethods<string>, message: string) => {
        if (value) state.set('');
        else state.set(message);
    }

    return (
        <ClientLayout>
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
                    loading={loadingState.get()}
                > Đăng nhập </Button>
            </form>
            
        </ClientLayout>
    );
}

export default LoginPage;