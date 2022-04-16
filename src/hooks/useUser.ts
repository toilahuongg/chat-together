import { createState, State, useState } from "@hookstate/core";
import { defaultUser } from "@src/contants/user.contant";
import axios from "axios";
import { IUser } from "server/types/user.type";

const userState = createState<IUser>(defaultUser());
const wrapState = (s: State<IUser>) => ({
    ...s,
    loginUser: () => new Promise(
        (resolve, reject) => axios.post('/api/login', s.get()).then(res => resolve(res.data))
        .catch(err => reject(err))
    ),
    registerUser: () => new Promise(
        (resolve, reject) => axios.post('/api/register', s.get()).then(res => resolve(res.data))
        .catch(err => reject(err))
    )
});

export const useUser = () => wrapState(useState(userState))

export default useUser;