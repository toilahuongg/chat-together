import { createState, useState } from "@hookstate/core";
import { Persistence } from "@hookstate/persistence";
import { useMemo } from "react";

const authState = createState({ accessToken: "", refreshToken: "" });
export const useAuth = () => {
    const auth = useState(authState);
    if (typeof window !== 'undefined') auth.attach(Persistence('auth'));
    return useMemo(() => ({
        isAuth: !!auth.accessToken.get(),
        setAccessToken: auth.accessToken.set,
        setRefreshToken: auth.refreshToken.set
    }), [auth]);
}

export default useAuth;