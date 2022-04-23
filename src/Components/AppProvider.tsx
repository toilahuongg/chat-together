import { useState } from "@hookstate/core";
import useAuth from "@src/hooks/useAuth";
import useUser from "@src/hooks/useUser";
import { createContext, useCallback, useEffect } from "react"
import Loading from "./Loading";

const AppContext = createContext<null>(null);
const AppProvider = ({ children }) => {
    const isAuth = useAuth();
    const user = useUser();
    const loadingState = useState(true);
    const getUser = useCallback(async () => {
        try {
            loadingState.set(true);
            await user.getCurrentUser();
        } finally {
            loadingState.set(false);
        }
    }, []);
    useEffect(() => {
        if (isAuth) getUser();
        else loadingState.set(false);
    }, [isAuth]);
    return loadingState.get() ? <Loading /> : (
        <AppContext.Provider value={null}>
            { children }
            {/* { isAuth && !loadingState.get() && user.friends.length === 0 && (
                
            )} */}
        </AppContext.Provider>
    )

}

export default AppProvider;