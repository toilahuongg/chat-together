import axios from "axios";
import { useMemo } from "react";
import useAuth from "./useAuth";
import useSocket from "./useSocket";

export const useFetchAuth = () => {
    const socket = useSocket();
    const { accessToken: at, refreshToken, setAccessToken } = useAuth();
    return useMemo(() => {
        const instance = axios.create({
            baseURL: process.env.NEXT_PUBLIC_APP_URL
        });
        instance.interceptors.request.use(
            (config) => {
                if (at && config.headers) {
                    config.headers['Authorization'] = 'Bearer ' + at;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );
        instance.interceptors.response.use(
            (res) => {
                return res;
            },
            async (err) => {
                const originalConfig = err.config;
                if (originalConfig.url !== "/api/auth/sign-in" && err.response) {
                    // Access Token was expired
                    if (err.response.status === 401 && !originalConfig._retry) {
                        originalConfig._retry = true;
                        try {
                            socket.disconnect();
                            const rs = await axios.post("/api/auth/refresh-token", {
                                refreshToken: refreshToken,
                            });
                            const { accessToken } = rs.data;
                            setAccessToken(accessToken);
                            socket.auth = {
                                token: accessToken
                            }
                            socket.connect();
                            return instance(originalConfig);
                        } catch (_error) {
                            return Promise.reject(_error);
                        }
                    }
                }
                return Promise.reject(err);
            }
        );
        return instance;
    }, [socket, at, refreshToken]);

}