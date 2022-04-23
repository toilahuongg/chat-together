import axios from "axios";

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_APP_URL
  });

if (typeof window !== undefined) {
    instance.interceptors.request.use(
        (config) => {
          const auth = window.localStorage.getItem('auth');
          const { token, refreshToken } = auth ? JSON.parse(auth) : null;
          if (token && config.headers) {
            config.headers['Authorization'] = 'Bearer '+ token;
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
                const auth = window.localStorage.getItem('auth');
                const { refreshToken } = auth ? JSON.parse(auth) : null;
                const rs = await axios.post("/api/auth/refresh-token", {
                  refreshToken: refreshToken,
                });
                const { token } = rs.data;
                window.localStorage.setItem('auth', JSON.stringify({ token, refreshToken}))
                return instance(originalConfig);
              } catch (_error) {
                return Promise.reject(_error);
              }
            }
          }
          return Promise.reject(err);
        }
      );
}

export default instance;