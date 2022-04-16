import { StateMethods } from "@hookstate/core";

export const validateUsername = (value: string, state: StateMethods<string>) => {
    if (!value) state.set('Tài khoản không được để trống!');
    else if (value.length <= 3 || value.length >= 32) state.set('Tài khoản với lớn hơn 3 và nhỏ hơn 32 ký tự!');
    else if (!/^[a-zA-Z0-9]+$/.test(value)) state.set('Tài khoản không được chứa ký tự đặc biệt!')
    else state.set('');
}

export const validateFullname = (value: string, state: StateMethods<string>) => {
    if (!value) state.set('Bạn không được để trống họ và tên!');
    else state.set('');
}

export const validateEmail = (value: string, state: StateMethods<string>) => {
    if (!value) state.set('Email không được để trống!');
    else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)) state.set('Email này không hợp lệ!')
    else state.set('');
}

export const validatePassword = (value: string, state: StateMethods<string>) => {
    if (!value) state.set('Password không được để trống!');
    else if (value.length <= 5) state.set('Mật khẩu phải lớn hơn 5 ký tự')
    else state.set('');
}

export const validateConfirmPassword = (value: string, password: string, state: StateMethods<string>) => {
    if (value !== password) state.set('Mật khẩu không khớp!');
    else state.set('');
}

export const validatePhone = (value: string, state: StateMethods<string>) => {
    if (!value) state.set('Số điện thoại không được để trống!');
    else if (!/^(03|05|07|08|09)(\d){8,9}$/.test(value)) state.set('Số điện thoại không hợp lệ!');
    else state.set('');
}